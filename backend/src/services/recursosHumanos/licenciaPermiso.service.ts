import { AppDataSource } from "../../config/configDB.js";
import { LicenciaPermiso, EstadoSolicitud, TipoSolicitud } from "../../entity/recursosHumanos/licenciaPermiso.entity.js";
import { Trabajador } from "../../entity/recursosHumanos/trabajador.entity.js";
import { User } from "../../entity/user.entity.js";
import { CreateLicenciaPermisoDTO, UpdateLicenciaPermisoDTO } from "../../types/recursosHumanos/licenciaPermiso.dto.js";
import { ServiceResponse } from "../../../types.js";
import { EstadoLaboral } from "../../entity/recursosHumanos/fichaEmpresa.entity.js";
import { actualizarEstadoFichaService } from "./fichaEmpresa.service.js";
import { LessThan, Not, LessThanOrEqual, MoreThanOrEqual, MoreThan } from "typeorm";
import { FileManagementService } from "../fileManagement.service.js";
import { FileUploadService } from "../fileUpload.service.js";

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
      const fechaString = data.fechaInicio.toISOString().split('T')[0];
      fechaInicio = new Date(fechaString + 'T12:00:00');
    }
    
    if (typeof data.fechaFin === 'string') {
      fechaFin = new Date(data.fechaFin + 'T12:00:00');
    } else {
      // Si ya es un objeto Date, extraer solo la parte de fecha y crear nuevo Date al mediodía
      const fechaString = data.fechaFin.toISOString().split('T')[0];
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

export async function getAllLicenciasPermisosService(): Promise<ServiceResponse<LicenciaPermiso[]>> {
  try {
    const licenciaRepo = AppDataSource.getRepository(LicenciaPermiso);
    const licencias = await licenciaRepo.find({ 
      relations: ["trabajador", "revisadoPor"],
      order: {
        fechaSolicitud: "DESC"
      }
    });

    if (!licencias.length) return [null, "No hay solicitudes registradas."];
    return [licencias, null];
  } catch (error) {
    console.error("Error al obtener licencias/permisos:", error);
    return [null, "Error interno del servidor."];
  }
}

export async function getLicenciaPermisoByIdService(id: number): Promise<ServiceResponse<LicenciaPermiso>> {
  try {
    const licenciaRepo = AppDataSource.getRepository(LicenciaPermiso);
    const licencia = await licenciaRepo.findOne({
      where: { id },
      relations: ["trabajador", "revisadoPor"]
    });

    if (!licencia) return [null, "Solicitud no encontrada."];
    return [licencia, null];
  } catch (error) {
    console.error("Error al buscar la solicitud:", error);
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
    licencia.estado = data.estadoSolicitud;
    licencia.respuestaEncargado = data.respuestaEncargado;
    licencia.revisadoPor = data.revisadoPor;
    
    // Si el estado está cambiando a APROBADA
    if (data.estadoSolicitud === EstadoSolicitud.APROBADA && estadoAnterior !== EstadoSolicitud.APROBADA) {
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
      console.log(`🏢 Actualizando ficha de empresa para licencia ID ${licencia.id}`);
      console.log(`👤 Trabajador: ${licencia.trabajador.nombres} ${licencia.trabajador.apellidoPaterno}`);
      console.log(`📋 Tipo solicitud: ${licencia.tipo} → Estado laboral: ${estadoLaboral}`);
      console.log(`🏢 Ficha ID: ${licencia.trabajador.fichaEmpresa.id}`);
      
      const [fichaActualizada, errorFicha] = await actualizarEstadoFichaService(
        licencia.trabajador.fichaEmpresa.id,
        estadoLaboral,
        licencia.fechaInicio,
        licencia.fechaFin,
        licencia.motivoSolicitud
      );
      
      if (fichaActualizada) {
        console.log(`✅ Ficha actualizada exitosamente - Nuevo estado: ${fichaActualizada.estado}`);
      }

      if (errorFicha) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        return [null, errorFicha];
      }
    }

    // Guardar los cambios de la licencia
    await queryRunner.manager.save(licencia);
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

export async function deleteLicenciaPermisoService(id: number): Promise<ServiceResponse<LicenciaPermiso>> {
  try {
    const licenciaRepo = AppDataSource.getRepository(LicenciaPermiso);
    const licencia = await licenciaRepo.findOne({
      where: { id },
      relations: ["trabajador", "trabajador.fichaEmpresa", "revisadoPor"]
    });

    if (!licencia) return [null, "Solicitud no encontrada."];

    // Si la licencia estaba aprobada, volver el estado a ACTIVO
    if (licencia.estado === EstadoSolicitud.APROBADA && licencia.trabajador?.fichaEmpresa?.id) {
      const [fichaActualizada, errorFicha] = await actualizarEstadoFichaService(
        licencia.trabajador.fichaEmpresa.id,
        EstadoLaboral.ACTIVO,
        new Date()
      );

      if (errorFicha) {
        return [null, errorFicha];
      }
    }

    await licenciaRepo.remove(licencia);
    return [licencia, null];
  } catch (error) {
    console.error("Error al eliminar la solicitud:", error);
    return [null, "Error interno del servidor."];
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
                const [fichaActualizada, error] = await actualizarEstadoFichaService(
                    fichaEmpresa.id,
                    EstadoLaboral.ACTIVO,
                    new Date(),
                    undefined,
                    "Fin de licencia/permiso"
                );

                if (!error) {
                    actualizaciones++;
                }
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
    console.log(`📋 [SERVICIO-DESCARGA] Buscando licencia ID: ${id}`);
    
    const licenciaRepo = AppDataSource.getRepository(LicenciaPermiso);
    const licencia = await licenciaRepo.findOne({
      where: { id },
      relations: ["trabajador"]
    });

    if (!licencia) {
      console.log(`❌ [SERVICIO-DESCARGA] Licencia no encontrada: ${id}`);
      return [null, "Licencia/permiso no encontrado"];
    }

    console.log(`✅ [SERVICIO-DESCARGA] Licencia encontrada: ${licencia.tipo} - Trabajador: ${licencia.trabajador.nombres} ${licencia.trabajador.apellidoPaterno}`);
    console.log(`📁 [SERVICIO-DESCARGA] URL del archivo: ${licencia.archivoAdjuntoURL}`);

    if (!licencia.archivoAdjuntoURL) {
      console.log(`❌ [SERVICIO-DESCARGA] No hay archivo adjunto para la licencia ${id}`);
      return [null, "No hay archivo adjunto para esta solicitud"];
    }

    // Buscar el usuario para verificar rol y permisos
    console.log(`👤 [SERVICIO-DESCARGA] Verificando usuario: ${userRut}`);
    const userRepo = AppDataSource.getRepository(User);
    const usuario = await userRepo.findOne({ where: { rut: userRut } });
    
    if (!usuario) {
      console.log(`❌ [SERVICIO-DESCARGA] Usuario no encontrado: ${userRut}`);
      return [null, "Usuario no encontrado"];
    }

    console.log(`👤 [SERVICIO-DESCARGA] Usuario encontrado: ${usuario.nombres} ${usuario.apellidoPaterno} - Rol: ${usuario.role}`);

    // Verificar permisos: 
    // 1. Si es RRHH, Administrador o SuperAdministrador → puede descargar cualquier archivo
    // 2. Si es trabajador normal → solo puede descargar sus propios archivos
    const rolesPrivilegiados = ['RecursosHumanos', 'Administrador', 'SuperAdministrador'];
    const tienePrivilegios = rolesPrivilegiados.includes(usuario.role);

    console.log(`🔐 [SERVICIO-DESCARGA] ¿Tiene privilegios? ${tienePrivilegios} (Rol: ${usuario.role})`);

    if (!tienePrivilegios) {
      // Es un trabajador normal, verificar que sea el propietario
      console.log(`🔍 [SERVICIO-DESCARGA] Verificando propietario del archivo...`);
      const trabajadorRepo = AppDataSource.getRepository(Trabajador);
      const trabajador = await trabajadorRepo.findOne({ where: { rut: userRut } });
      
      if (!trabajador) {
        console.log(`❌ [SERVICIO-DESCARGA] Trabajador no encontrado para RUT: ${userRut}`);
        return [null, "Trabajador no encontrado"];
      }

      console.log(`👤 [SERVICIO-DESCARGA] Trabajador encontrado: ${trabajador.nombres} ${trabajador.apellidoPaterno} (ID: ${trabajador.id})`);
      console.log(`🔍 [SERVICIO-DESCARGA] ¿Es propietario? Trabajador ID: ${trabajador.id} vs Licencia Trabajador ID: ${licencia.trabajador.id}`);

      if (licencia.trabajador.id !== trabajador.id) {
        console.log(`❌ [SERVICIO-DESCARGA] Sin permisos: el trabajador ${trabajador.id} no es propietario de la licencia del trabajador ${licencia.trabajador.id}`);
        return [null, "No tiene permisos para descargar este archivo"];
      }
    }

    // Usar el servicio de archivos para obtener la ruta absoluta y correcta
    const filePath = FileUploadService.getLicenciaPath(licencia.archivoAdjuntoURL);
    
    console.log(`📂 [SERVICIO-DESCARGA] Ruta calculada: ${filePath}`);
    
    // Verificar si el archivo existe
    if (!FileUploadService.fileExists(filePath)) {
      console.log(`❌ [SERVICIO-DESCARGA] El archivo no se encuentra en el servidor: ${filePath}`);
      return [null, "El archivo del certificado no se encuentra en el servidor."];
    }

    // Generar nombre personalizado del archivo
    const nombres = licencia.trabajador.nombres?.trim() || '';
    const apellidoPaterno = licencia.trabajador.apellidoPaterno?.trim() || '';
    const apellidoMaterno = licencia.trabajador.apellidoMaterno?.trim() || '';
    
    console.log(`👤 [SERVICIO-DESCARGA] Datos del trabajador - Nombres: "${nombres}", Apellido P: "${apellidoPaterno}", Apellido M: "${apellidoMaterno}"`);
    console.log(`📋 [SERVICIO-DESCARGA] Tipo de licencia: "${licencia.tipo}"`);
    
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
    
    console.log(`🧹 [SERVICIO-DESCARGA] Nombres limpios - Nombres: "${nombreLimpio}", Apellido P: "${apellidoPaternoLimpio}", Apellido M: "${apellidoMaternoLimpio}"`);
    
    // Construir el nombre del archivo
    let customFilename = '';
    if (nombreLimpio) customFilename += nombreLimpio;
    if (apellidoPaternoLimpio) customFilename += (customFilename ? '_' : '') + apellidoPaternoLimpio;
    if (apellidoMaternoLimpio) customFilename += (customFilename ? '_' : '') + apellidoMaternoLimpio;
    
    // Si no hay nombres válidos, usar un fallback
    if (!customFilename) {
      customFilename = 'Documento';
    }
    
    // Agregar el tipo de solicitud
    const tipoSolicitud = licencia.tipo === TipoSolicitud.LICENCIA ? 'Licencia_Medica' : 'Permiso_Administrativo';
    customFilename += `-${tipoSolicitud}.pdf`;
    
    console.log(`📝 [SERVICIO-DESCARGA] Nombre personalizado generado: "${customFilename}"`);
    console.log(`✅ [SERVICIO-DESCARGA] Permisos validados correctamente. Retornando datos.`);
    
    return [{ filePath, customFilename }, null];
  } catch (error) {
    console.error("❌ [SERVICIO-DESCARGA] Error inesperado:", error);
    return [null, "Error interno del servidor"];
  }
}