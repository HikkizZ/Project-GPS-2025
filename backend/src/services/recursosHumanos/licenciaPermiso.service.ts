import { AppDataSource } from "../../config/configDB.js";
import { LicenciaPermiso, EstadoSolicitud } from "../../entity/recursosHumanos/licenciaPermiso.entity.js";
import { Trabajador } from "../../entity/recursosHumanos/trabajador.entity.js";
import { CreateLicenciaPermisoDTO, UpdateLicenciaPermisoDTO } from "../../types/recursosHumanos/licenciaPermiso.dto.js";
import { ServiceResponse } from "../../../types.js";

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
    const licencias = await licenciaRepo.find({ relations: ["trabajador"] });

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
      relations: ["trabajador"]
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
    const licencia = await licenciaRepo.findOneBy({ id });

    if (!licencia) return [null, "Solicitud no encontrada."];

    licencia.estado = data.estadoSolicitud;
    licencia.respuestaEncargado = data.respuestaEncargado ?? "";

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
    const licencia = await licenciaRepo.findOneBy({ id });

    if (!licencia) return [null, "Solicitud no encontrada."];

    await licenciaRepo.remove(licencia);
    return [licencia, null];
  } catch (error) {
    console.error("Error al eliminar la solicitud:", error);
    return [null, "Error interno del servidor."];
  }
}