import { AppDataSource } from "../../config/configDB.js";
import { LicenciaPermiso, EstadoSolicitud, TipoSolicitud } from "../../entity/recursosHumanos/licenciaPermiso.entity.js";
import { Trabajador } from "../../entity/recursosHumanos/trabajador.entity.js";
import { CreateLicenciaPermisoDTO, UpdateLicenciaPermisoDTO } from "../../types/recursosHumanos/licenciaPermiso.dto.js";
import { ServiceResponse } from "../../../types.js";
import { EstadoLaboral } from "../../entity/recursosHumanos/fichaEmpresa.entity.js";
import { actualizarEstadoFichaService } from "./fichaEmpresa.service.js";
import { LessThan, Not, LessThanOrEqual, MoreThanOrEqual } from "typeorm";

export async function createLicenciaPermisoService(data: CreateLicenciaPermisoDTO): Promise<ServiceResponse<LicenciaPermiso>> {
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
      await queryRunner.release();
      return [null, "Trabajador no encontrado."];
    }

    // Verificar si ya existe una licencia/permiso activo
    const licenciaActiva = await licenciaRepo.findOne({
      where: {
        trabajador: { id: trabajador.id },
        estado: EstadoSolicitud.APROBADA,
        fechaFin: MoreThanOrEqual(new Date())
      }
    });

    if (licenciaActiva) {
      await queryRunner.release();
      return [null, "Ya existe una licencia o permiso activo para este trabajador."];
    }

    const nuevaLicencia = licenciaRepo.create({
      tipo: data.tipo,
      fechaInicio: new Date(data.fechaInicio),
      fechaFin: new Date(data.fechaFin),
      motivoSolicitud: data.motivoSolicitud,
      archivoAdjuntoURL: data.archivoAdjuntoURL ?? "",
      trabajador,
      estado: EstadoSolicitud.PENDIENTE,
    });

    await queryRunner.manager.save(nuevaLicencia);
    await queryRunner.commitTransaction();
    return [nuevaLicencia, null];
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error("Error al crear licencia/permiso:", error);
    return [null, "Error interno del servidor."];
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

    if (!data.respuestaEncargado || !data.revisadoPor) {
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
      const [fichaActualizada, errorFicha] = await actualizarEstadoFichaService(
        licencia.trabajador.fichaEmpresa.id,
        estadoLaboral,
        licencia.fechaInicio,
        licencia.fechaFin,
        licencia.motivoSolicitud
      );

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
            
            // Verificar si hay otra licencia vigente
            const otraLicenciaVigente = await licenciaRepo.findOne({
                where: {
                    trabajador: { id: licencia.trabajador.id },
                    estado: EstadoSolicitud.APROBADA,
                    id: Not(licencia.id),
                    fechaInicio: LessThanOrEqual(hoy),
                    fechaFin: MoreThanOrEqual(hoy)
                }
            });

            // Solo actualizar si no hay otra licencia vigente
            if (!otraLicenciaVigente && 
                (fichaEmpresa.estado === EstadoLaboral.LICENCIA || fichaEmpresa.estado === EstadoLaboral.PERMISO)) {
                // Actualizar el estado de la ficha a ACTIVO
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