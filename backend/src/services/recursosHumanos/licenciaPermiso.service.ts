import { AppDataSource } from "../../config/configDB.js";
import { LicenciaPermiso, EstadoSolicitud, TipoSolicitud } from "../../entity/recursosHumanos/licenciaPermiso.entity.js";
import { Trabajador } from "../../entity/recursosHumanos/trabajador.entity.js";
import { User } from "../../entity/user.entity.js";
import { CreateLicenciaPermisoDTO, UpdateLicenciaPermisoDTO } from "../../types/recursosHumanos/licenciaPermiso.dto.js";
import { ServiceResponse } from "../../../types.js";
import { EstadoLaboral } from "../../entity/recursosHumanos/fichaEmpresa.entity.js";
import { LessThan, Not, LessThanOrEqual, MoreThanOrEqual, MoreThan } from "typeorm";
import { FileManagementService } from "../fileManagement.service.js";
import { FileUploadService } from "../fileUpload.service.js";
import { sendLicenciaPermisoApprovedEmail, sendLicenciaPermisoRejectedEmail } from "../email.service.js";

/**
 * Normaliza el tipo de solicitud - solo acepta valores exactos para mayor profesionalismo
 */
function normalizarTipoSolicitud(tipoInput: string): TipoSolicitud | null {
  const tipoLimpio = tipoInput.trim();
  
  // Solo valores exactos del enum - más profesional y predecible
  const mapeoTipos: { [key: string]: TipoSolicitud } = {
    "Licencia médica": TipoSolicitud.LICENCIA,
    "Permiso administrativo": TipoSolicitud.PERMISO
  };
  
  return mapeoTipos[tipoLimpio] || null;
}

export async function createLicenciaPermisoService(data: CreateLicenciaPermisoDTO & { file?: Express.Multer.File }): Promise<ServiceResponse<LicenciaPermiso>> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const trabajadorRepo = queryRunner.manager.getRepository(Trabajador);
    const licenciaRepo = queryRunner.manager.getRepository(LicenciaPermiso);

    const trabajador = await trabajadorRepo.findOne({ 
      where: { id: data.trabajadorId },
      relations: ["fichaEmpresa"]
    });

    if (!trabajador) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return [null, "Trabajador no encontrado"];
    }

    if (!trabajador.enSistema) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return [null, "No se puede crear solicitud para un trabajador inactivo"];
    }

    // Validar fechas - usar comparación de strings y crear fechas locales correctamente
    const hoy = new Date();
    const fechaHoyString = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

    // Comparar directamente las cadenas de fecha en formato yyyy-mm-dd
    if (data.fechaInicio < fechaHoyString) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return [null, "La fecha de inicio debe ser hoy o en el futuro"];
    }

    // Crear fechas locales correctamente manejando tanto strings como objetos Date
    let fechaInicio: Date;
    let fechaFin: Date;
    
    if (typeof data.fechaInicio === 'string') {
      fechaInicio = new Date(data.fechaInicio + 'T12:00:00');
    } else {
      // Si ya es un objeto Date, extraer solo la parte de fecha y crear nuevo Date al mediodía
      const fechaString = (data.fechaInicio as Date).toISOString().split('T')[0];
      fechaInicio = new Date(fechaString + 'T12:00:00');
    }
    
    if (typeof data.fechaFin === 'string') {
      fechaFin = new Date(data.fechaFin + 'T12:00:00');
    } else {
      // Si ya es un objeto Date, extraer solo la parte de fecha y crear nuevo Date al mediodía
      const fechaString = (data.fechaFin as Date).toISOString().split('T')[0];
      fechaFin = new Date(fechaString + 'T12:00:00');
    }

    if (fechaFin <= fechaInicio) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return [null, "La fecha de fin debe ser posterior a la fecha de inicio"];
    }

    // Validar que no se solapen con otras licencias aprobadas
    const solapamientos = await licenciaRepo.find({
      where: [
        {
          trabajador: { id: data.trabajadorId },
          estado: EstadoSolicitud.APROBADA,
          fechaInicio: LessThanOrEqual(fechaFin),
          fechaFin: MoreThanOrEqual(fechaInicio)
        }
      ]
    });

    if (solapamientos.length > 0) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return [null, "Las fechas se solapan con otra licencia o permiso ya aprobado"];
    }

    // Procesar archivo adjunto si existe
    let archivoAdjuntoURL: string | undefined;
    if (data.file) {
      const fileInfo = FileManagementService.processUploadedFile(data.file);
      archivoAdjuntoURL = fileInfo.url;
    }

    // Validar que las licencias médicas tengan archivo adjunto
    if (data.tipo === TipoSolicitud.LICENCIA && !archivoAdjuntoURL) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return [null, "Las licencias médicas requieren un archivo adjunto"];
    }

    const nuevaLicencia = licenciaRepo.create({
      trabajador,
      tipo: data.tipo,
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      motivoSolicitud: data.motivoSolicitud,
      archivoAdjuntoURL: archivoAdjuntoURL,
      estado: EstadoSolicitud.PENDIENTE
    });

    await queryRunner.manager.save(nuevaLicencia);
    await queryRunner.commitTransaction();

    return [nuevaLicencia, null];
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error("Error al crear licencia/permiso:", error);
    return [null, "Error interno del servidor"];
  } finally {
    await queryRunner.release();
  }
}

export async function getAllLicenciasPermisosService(filtros: any = {}): Promise<ServiceResponse<LicenciaPermiso[]>> {
  try {
    const licenciaRepo = AppDataSource.getRepository(LicenciaPermiso);
    const userRepo = AppDataSource.getRepository(User);
    
    // Crear el query builder para usar búsquedas más flexibles
    const queryBuilder = licenciaRepo.createQueryBuilder('licencia')
      .leftJoinAndSelect('licencia.trabajador', 'trabajador')
      .leftJoinAndSelect('licencia.revisadoPor', 'revisadoPor');

    // Agregar filtros por campos si existen
    if (filtros.id) {
      queryBuilder.andWhere('licencia.id = :id', { id: filtros.id });
    }
    if (filtros.trabajadorId) {
      queryBuilder.andWhere('trabajador.id = :trabajadorId', { trabajadorId: filtros.trabajadorId });
    }
    if (filtros.tipo) {
      // Mapeo inteligente para tipos legibles
      const tipoNormalizado = normalizarTipoSolicitud(filtros.tipo);
      if (tipoNormalizado) {
        queryBuilder.andWhere('licencia.tipo = :tipo', { tipo: tipoNormalizado });
      }
    }
    if (filtros.estado) {
      queryBuilder.andWhere('licencia.estado = :estado', { estado: filtros.estado });
    }
    if (filtros.fechaInicio) {
      queryBuilder.andWhere('licencia.fechaInicio = :fechaInicio', { fechaInicio: filtros.fechaInicio });
    }
    if (filtros.fechaFin) {
      queryBuilder.andWhere('licencia.fechaFin = :fechaFin', { fechaFin: filtros.fechaFin });
    }
    if (filtros.fechaSolicitud) {
      queryBuilder.andWhere('DATE(licencia.fechaSolicitud) = :fechaSolicitud', { fechaSolicitud: filtros.fechaSolicitud });
    }
    if (filtros.motivoSolicitud) {
      queryBuilder.andWhere('licencia.motivoSolicitud ILIKE :motivoSolicitud', { motivoSolicitud: `%${filtros.motivoSolicitud}%` });
    }
    if (filtros.revisadoPorId) {
      queryBuilder.andWhere('revisadoPor.id = :revisadoPorId', { revisadoPorId: filtros.revisadoPorId });
    }
    
    // Filtros por campos del trabajador
    if (filtros.trabajadorRut) {
      queryBuilder.andWhere('trabajador.rut ILIKE :trabajadorRut', { trabajadorRut: `%${filtros.trabajadorRut}%` });
    }
    if (filtros.trabajadorNombres) {
      queryBuilder.andWhere('trabajador.nombres ILIKE :trabajadorNombres', { trabajadorNombres: `%${filtros.trabajadorNombres}%` });
    }
    if (filtros.trabajadorApellidos) {
      // Búsqueda inteligente en apellidos: permite buscar por uno solo o ambos juntos
      const apellidosBusqueda = filtros.trabajadorApellidos.trim();
      
      // Si contiene espacios, buscar la frase completa en la concatenación
      if (apellidosBusqueda.includes(' ')) {
        queryBuilder.andWhere(
          'CONCAT(trabajador.apellidoPaterno, \' \', trabajador.apellidoMaterno) ILIKE :apellidosCompletos',
          { apellidosCompletos: `%${apellidosBusqueda}%` }
        );
      } else {
        // Si no contiene espacios, buscar en cualquiera de los dos campos
        queryBuilder.andWhere(
          '(trabajador.apellidoPaterno ILIKE :apellidos OR trabajador.apellidoMaterno ILIKE :apellidos)',
          { apellidos: `%${apellidosBusqueda}%` }
        );
      }
    }

    // Ordenar por fecha de solicitud descendente
    queryBuilder.orderBy('licencia.fechaSolicitud', 'DESC');

    const licencias = await queryBuilder.getMany();

    // Cargar usuarios manualmente para cada trabajador
    for (const licencia of licencias) {
      if (licencia.trabajador?.rut) {
        const usuario = await userRepo.findOne({
          where: { rut: licencia.trabajador.rut },
          select: ['id', 'email', 'role']
        });
        if (usuario) {
          licencia.trabajador.usuario = usuario;
        }
      }
    }

    // Devolver array vacío en lugar de error cuando no hay solicitudes
    return [licencias, null];
  } catch (error) {
    console.error("Error al obtener licencias/permisos:", error);
    return [null, "Error interno del servidor."];
  }
}

export async function updateLicenciaPermisoService(id: number, data: UpdateLicenciaPermisoDTO): Promise<ServiceResponse<LicenciaPermiso>> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const licenciaRepo = queryRunner.manager.getRepository(LicenciaPermiso);
    const licencia = await licenciaRepo.findOne({
      where: { id },
      relations: ["trabajador", "trabajador.fichaEmpresa", "revisadoPor"]
    });

    if (!licencia) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return [null, "Solicitud no encontrada."];
    }

    if (!data.revisadoPor) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return [null, "Faltan datos requeridos para la actualización."];
    }

    const estadoAnterior = licencia.estado;
    
    // Actualizar los campos de la licencia
    licencia.estado = data.estado;
    licencia.respuestaEncargado = data.respuestaEncargado || '';
    licencia.revisadoPor = data.revisadoPor;
    
    // Si el estado está cambiando a APROBADA
    if (data.estado === EstadoSolicitud.APROBADA && estadoAnterior !== EstadoSolicitud.APROBADA) {
      if (!licencia.trabajador?.fichaEmpresa?.id) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        return [null, "Error: Ficha de empresa no encontrada"];
      }

      // Determinar el estado laboral según el tipo de solicitud
      const estadoLaboral = licencia.tipo === TipoSolicitud.LICENCIA ? 
        EstadoLaboral.LICENCIA : EstadoLaboral.PERMISO;

      // Verificar si hay solapamiento con otras licencias/permisos aprobados
      const solapamiento = await licenciaRepo.findOne({
        where: [
          {
            trabajador: { id: licencia.trabajador.id },
            estado: EstadoSolicitud.APROBADA,
            id: Not(licencia.id),
            fechaInicio: LessThanOrEqual(licencia.fechaFin),
            fechaFin: MoreThanOrEqual(licencia.fechaInicio)
          }
        ]
      });

      if (solapamiento) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        return [null, "Las fechas se solapan con otra licencia o permiso ya aprobado"];
      }

      // Actualizar el estado en la ficha de empresa
      // Eliminar la importación de actualizarEstadoFichaService
      // import { actualizarEstadoFichaService } from "./fichaEmpresa.service.js";
      // Eliminar o adaptar el uso de actualizarEstadoFichaService en el archivo
      // const [fichaActualizada, errorFicha] = await actualizarEstadoFichaService(
      //   licencia.trabajador.fichaEmpresa.id,
      //   estadoLaboral,
      //   licencia.fechaInicio,
      //   licencia.fechaFin,
      //   licencia.motivoSolicitud
      // );

      // if (errorFicha) {
      //   await queryRunner.rollbackTransaction();
      //   await queryRunner.release();
      //   return [null, errorFicha];
      // }
    }

    // Guardar los cambios de la licencia
    await queryRunner.manager.save(licencia);
    
    // Enviar notificación por correo electrónico después de guardar exitosamente
    if (estadoAnterior !== data.estado) {
      try {
        const nombreCompleto = `${licencia.trabajador.nombres} ${licencia.trabajador.apellidoPaterno}`;
        const tipoSolicitudTexto = licencia.tipo === TipoSolicitud.LICENCIA ? 'Licencia Médica' : 'Permiso Administrativo';
        
        if (data.estado === EstadoSolicitud.APROBADA) {
          await sendLicenciaPermisoApprovedEmail({
            to: licencia.trabajador.correoPersonal,
            nombre: nombreCompleto,
            tipoSolicitud: tipoSolicitudTexto,
            fechaInicio: licencia.fechaInicio.toISOString(),
            fechaFin: licencia.fechaFin.toISOString(),
            motivoRespuesta: data.respuestaEncargado || undefined
          });
        } else if (data.estado === EstadoSolicitud.RECHAZADA) {
          await sendLicenciaPermisoRejectedEmail({
            to: licencia.trabajador.correoPersonal,
            nombre: nombreCompleto,
            tipoSolicitud: tipoSolicitudTexto,
            fechaInicio: licencia.fechaInicio.toISOString(),
            fechaFin: licencia.fechaFin.toISOString(),
            motivoRechazo: data.respuestaEncargado || 'No se proporcionó motivo específico'
          });
        }
      } catch (emailError) {
        // Si hay error en el envío de correo, lo registramos pero no fallamons la operación
        console.error('Error al enviar correo de notificación:', emailError);
      }
    }

    await queryRunner.commitTransaction();

    return [licencia, null];
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error("Error al actualizar la solicitud:", error);
    return [null, "Error interno del servidor."];
  } finally {
    await queryRunner.release();
  }
}



export async function verificarLicenciasVencidasService(): Promise<ServiceResponse<number>> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const licenciaRepo = queryRunner.manager.getRepository(LicenciaPermiso);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        // Buscar licencias/permisos vencidos que aún no han sido procesados
        const licenciasVencidas = await licenciaRepo.find({
            where: {
                estado: EstadoSolicitud.APROBADA,
                fechaFin: LessThan(hoy)
            },
            relations: ["trabajador", "trabajador.fichaEmpresa"]
        });

        let actualizaciones = 0;

        for (const licencia of licenciasVencidas) {
            if (!licencia.trabajador?.fichaEmpresa?.id) continue;

            // Verificar si la ficha aún está en estado de licencia/permiso
            const fichaEmpresa = licencia.trabajador.fichaEmpresa;
            
            // Verificar si hay alguna licencia vigente
            const licenciaVigente = await licenciaRepo.findOne({
                where: {
                    trabajador: { id: licencia.trabajador.id },
                    estado: EstadoSolicitud.APROBADA,
                    tipo: TipoSolicitud.LICENCIA,
                    fechaFin: MoreThan(new Date())
                }
            });

            // Solo cambiar a ACTIVO si no hay licencias vigentes
            if (!licenciaVigente) {
                // Eliminar la importación de actualizarEstadoFichaService
                // import { actualizarEstadoFichaService } from "./fichaEmpresa.service.js";
                // Eliminar o adaptar el uso de actualizarEstadoFichaService en el archivo
                // const [fichaActualizada, error] = await actualizarEstadoFichaService(
                //     fichaEmpresa.id,
                //     EstadoLaboral.ACTIVO,
                //     new Date(),
                //     undefined,
                //     "Fin de licencia/permiso"
                // );

                // if (!error) {
                //     actualizaciones++;
                // }
            }
        }

        await queryRunner.commitTransaction();
        return [actualizaciones, null];
    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("Error en verificarLicenciasVencidasService:", error);
        return [null, "Error interno del servidor"];
    } finally {
        await queryRunner.release();
    }
}

/**
 * Servicio para descargar archivo de licencia/permiso
 */
export async function descargarArchivoLicenciaService(id: number, userRut: string): Promise<ServiceResponse<{ filePath: string; customFilename: string }>> {
  try {
    const licenciaRepo = AppDataSource.getRepository(LicenciaPermiso);
    const licencia = await licenciaRepo.findOne({
      where: { id },
      relations: ["trabajador"]
    });

    if (!licencia) {
      return [null, "Licencia/permiso no encontrado"];
    }

    if (!licencia.archivoAdjuntoURL) {
      return [null, "No hay archivo adjunto para esta solicitud"];
    }

    // Buscar el usuario para verificar rol y permisos
    const userRepo = AppDataSource.getRepository(User);
    const usuario = await userRepo.findOne({ where: { rut: userRut } });
    
    if (!usuario) {
      return [null, "Usuario no encontrado"];
    }

    // Verificar permisos: 
    // 1. Si es RRHH, Administrador o SuperAdministrador → puede descargar cualquier archivo
    // 2. Si es trabajador normal → solo puede descargar sus propios archivos
    const rolesPrivilegiados = ['RecursosHumanos', 'Administrador', 'SuperAdministrador'];
    const tienePrivilegios = rolesPrivilegiados.includes(usuario.role);

    if (!tienePrivilegios) {
      // Es un trabajador normal, verificar que sea el propietario
      const trabajadorRepo = AppDataSource.getRepository(Trabajador);
      const trabajador = await trabajadorRepo.findOne({ where: { rut: userRut } });
      
      if (!trabajador) {
        return [null, "Trabajador no encontrado"];
      }

      if (licencia.trabajador.id !== trabajador.id) {
        return [null, "No tiene permisos para descargar este archivo"];
      }
    }

    // Usar el servicio de archivos para obtener la ruta absoluta y correcta
    const filePath = FileUploadService.getLicenciaPath(licencia.archivoAdjuntoURL);
    
    // Verificar si el archivo existe
    if (!FileUploadService.fileExists(filePath)) {
      return [null, "El archivo del certificado no se encuentra en el servidor."];
    }

    // Generar nombre personalizado del archivo - SOLO para licencias médicas
    const nombres = licencia.trabajador.nombres?.trim() || '';
    const apellidoPaterno = licencia.trabajador.apellidoPaterno?.trim() || '';
    const apellidoMaterno = licencia.trabajador.apellidoMaterno?.trim() || '';
    
    // Función para limpiar nombres (solo letras, números y algunos caracteres seguros)
    const limpiarNombre = (texto: string): string => {
      return texto
        .replace(/\s+/g, '_') // Espacios a guiones bajos
        .replace(/[^a-zA-ZÀ-ÿ\u00f1\u00d10-9_]/g, '') // Solo letras, números y guiones bajos
        .replace(/_+/g, '_') // Múltiples guiones bajos a uno solo
        .replace(/^_|_$/g, ''); // Quitar guiones bajos al inicio y final
    };
    
    const nombreLimpio = limpiarNombre(nombres);
    const apellidoPaternoLimpio = limpiarNombre(apellidoPaterno);
    const apellidoMaternoLimpio = limpiarNombre(apellidoMaterno);
    
    // Construir el nombre del archivo - SOLO para licencias médicas (permisos no tienen archivo)
    let customFilename = '';
    if (licencia.tipo === TipoSolicitud.LICENCIA) {
      if (nombreLimpio) customFilename += nombreLimpio;
      if (apellidoPaternoLimpio) customFilename += (customFilename ? '_' : '') + apellidoPaternoLimpio;
      if (apellidoMaternoLimpio) customFilename += (customFilename ? '_' : '') + apellidoMaternoLimpio;
      
      // Si no hay nombres válidos, usar un fallback
      if (!customFilename) {
        customFilename = 'Documento';
      }
      
      customFilename += `-Licencia_Medica.pdf`;
    } else {
      // Esto no debería pasar, pero por seguridad
      customFilename = `Licencia_${id}.pdf`;
    }
    
    return [{ filePath, customFilename }, null];
  } catch (error) {
    console.error("Error en descargarArchivoLicenciaService:", error);
    return [null, "Error interno del servidor"];
  }
}