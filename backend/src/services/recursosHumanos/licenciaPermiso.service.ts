import { AppDataSource } from "../../config/configDB.js";
import { LicenciaPermiso, EstadoSolicitud, TipoSolicitud } from "../../entity/recursosHumanos/licenciaPermiso.entity.js";
import { Trabajador } from "../../entity/recursosHumanos/trabajador.entity.js";
import { CreateLicenciaPermisoDTO, UpdateLicenciaPermisoDTO } from "../../types/recursosHumanos/licenciaPermiso.dto.js";
import { ServiceResponse } from "../../../types.js";
import { EstadoLaboral } from "../../entity/recursosHumanos/fichaEmpresa.entity.js";
import { actualizarEstadoFichaService } from "./fichaEmpresa.service.js";

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
        motivoSolicitud: data.motivo,
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
  try {
    const licenciaRepo = AppDataSource.getRepository(LicenciaPermiso);
    const licencia = await licenciaRepo.findOne({
      where: { id },
      relations: ["trabajador", "revisadoPor"]
    });

    if (!licencia) return [null, "Solicitud no encontrada."];

    // Si el estado está cambiando a APROBADA
    if (data.estadoSolicitud === EstadoSolicitud.APROBADA && licencia.estado !== EstadoSolicitud.APROBADA) {
      // Determinar el estado laboral según el tipo de solicitud
      const estadoLaboral = licencia.tipo === TipoSolicitud.LICENCIA ? 
        EstadoLaboral.LICENCIA : EstadoLaboral.PERMISO;

      // Actualizar el estado en la ficha de empresa
      const [fichaActualizada, errorFicha] = await actualizarEstadoFichaService(
        licencia.trabajador.id,
        estadoLaboral,
        licencia.fechaInicio,
        licencia.fechaFin
      );

      if (errorFicha) {
        return [null, errorFicha];
      }
    }

    // Actualizar la licencia/permiso
    licencia.estado = data.estadoSolicitud;
    licencia.respuestaEncargado = data.respuestaEncargado ?? "";
    if (data.revisadoPor) {
      licencia.revisadoPor = data.revisadoPor;
    }

    await licenciaRepo.save(licencia);
    return [licencia, null];
  } catch (error) {
    console.error("Error al actualizar la solicitud:", error);
    return [null, "Error interno del servidor."];
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