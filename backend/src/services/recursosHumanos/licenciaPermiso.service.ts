import { AppDataSource } from "../../config/configDB.js";
import { LicenciaPermiso, EstadoSolicitud, TipoSolicitud } from "../../entity/recursosHumanos/licenciaPermiso.entity.js";
import { Trabajador } from "../../entity/recursosHumanos/trabajador.entity.js";
import { CreateLicenciaPermisoDTO, UpdateLicenciaPermisoDTO } from "../../types/recursosHumanos/licenciaPermiso.dto.js";
import { ServiceResponse } from "../../../types.js";
import { EstadoLaboral } from "../../entity/recursosHumanos/fichaEmpresa.entity.js";
import { actualizarEstadoFichaService } from "./fichaEmpresa.service.js";
import { Not, LessThanOrEqual, MoreThanOrEqual } from "typeorm";

export async function createLicenciaPermisoService(data: CreateLicenciaPermisoDTO): Promise<ServiceResponse<LicenciaPermiso>> {
  try {
    const licenciaRepo = AppDataSource.getRepository(LicenciaPermiso);
    const trabajadorRepo = AppDataSource.getRepository(Trabajador);

    const trabajador = await trabajadorRepo.findOneBy({ id: data.trabajadorId });
    if (!trabajador) return [null, "Trabajador no encontrado."];

    const nuevaLicencia = licenciaRepo.create({
        tipo: data.tipo,
        fechaInicio: new Date(data.fechaInicio),
        fechaFin: new Date(data.fechaFin),
        motivoSolicitud: data.motivoSolicitud,
        archivoAdjuntoURL: data.archivoAdjuntoURL ?? "",
        trabajador,
        estado: EstadoSolicitud.PENDIENTE,
    });

    await licenciaRepo.save(nuevaLicencia);
    return [nuevaLicencia, null];
  } catch (error) {
    console.error("Error al crear licencia/permiso:", error);
    return [null, "Error interno del servidor."];
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
      relations: ["trabajador", "revisadoPor"]
    });

    if (!licencia) {
      await queryRunner.release();
      return [null, "Solicitud no encontrada."];
    }

    // Si el estado está cambiando a APROBADA
    if (data.estadoSolicitud === EstadoSolicitud.APROBADA && licencia.estado !== EstadoSolicitud.APROBADA) {
      // Determinar el estado laboral según el tipo de solicitud
      const estadoLaboral = licencia.tipo === TipoSolicitud.LICENCIA ? 
        EstadoLaboral.LICENCIA : EstadoLaboral.PERMISO;

      // Verificar si hay solapamiento con otras licencias/permisos aprobados
      const solapamiento = await licenciaRepo.findOne({
        where: [
          {
            trabajador: { id: licencia.trabajador.id },
            estado: EstadoSolicitud.APROBADA,
            id: Not(licencia.id), // Excluir la licencia actual
            fechaInicio: LessThanOrEqual(licencia.fechaFin),
            fechaFin: MoreThanOrEqual(licencia.fechaInicio)
          }
        ]
      });

      if (solapamiento) {
        await queryRunner.release();
        return [null, "Las fechas se solapan con otra licencia o permiso ya aprobado"];
      }

      // Actualizar el estado en la ficha de empresa
      const [fichaActualizada, errorFicha] = await actualizarEstadoFichaService(
        licencia.trabajador.fichaEmpresa.id, // Cambiado de trabajador.id a fichaEmpresa.id
        estadoLaboral,
        licencia.fechaInicio,
        licencia.fechaFin,
        licencia.motivoSolicitud
        // No enviamos userId para que se procese como actualización automática
      );

      if (errorFicha) {
        await queryRunner.release();
        return [null, errorFicha];
      }
    }

    // Si el estado está cambiando a RECHAZADA, no necesitamos hacer nada con la ficha
    licencia.estado = data.estadoSolicitud;
    if (data.respuestaEncargado) {
      licencia.respuestaEncargado = data.respuestaEncargado;
    }
    if (data.revisadoPor) {
      licencia.revisadoPor = data.revisadoPor;
    }

    const licenciaActualizada = await queryRunner.manager.save(LicenciaPermiso, licencia);
    await queryRunner.commitTransaction();
    return [licenciaActualizada, null];
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
      relations: ["trabajador", "revisadoPor"]
    });

    if (!licencia) return [null, "Solicitud no encontrada."];

    // Si la licencia estaba aprobada, volver el estado a ACTIVO
    if (licencia.estado === EstadoSolicitud.APROBADA) {
      const [fichaActualizada, errorFicha] = await actualizarEstadoFichaService(
        licencia.trabajador.id,
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
        fechaFin: LessThanOrEqual(hoy)
      },
      relations: ["trabajador"]
    });

    let actualizacionesExitosas = 0;

    for (const licencia of licenciasVencidas) {
      // Verificar si no hay otra licencia/permiso vigente que comience justo después
      const licenciaSiguiente = await licenciaRepo.findOne({
        where: {
          trabajador: { id: licencia.trabajador.id },
          estado: EstadoSolicitud.APROBADA,
          fechaInicio: LessThanOrEqual(new Date(hoy.getTime() + 24 * 60 * 60 * 1000)), // mañana
          id: Not(licencia.id)
        }
      });

      // Solo actualizar si no hay una licencia siguiente inmediata
      if (!licenciaSiguiente) {
        const [fichaActualizada, error] = await actualizarEstadoFichaService(
          licencia.trabajador.id,
          EstadoLaboral.ACTIVO,
          new Date(),
          undefined,
          "Fin de período de licencia/permiso"
        );

        if (!error) {
          actualizacionesExitosas++;
        } else {
          console.error(`Error al actualizar ficha del trabajador ${licencia.trabajador.id}:`, error);
        }
      }
    }

    await queryRunner.commitTransaction();
    return [actualizacionesExitosas, null];
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error("Error al verificar licencias vencidas:", error);
    return [null, "Error interno del servidor"];
  } finally {
    await queryRunner.release();
  }
}