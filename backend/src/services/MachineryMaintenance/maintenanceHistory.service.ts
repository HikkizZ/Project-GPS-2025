import { AppDataSource } from "config/configDB.js";
import { MaintenanceHistory } from "entity/MachineryMaintenance/MaintenanceHistory.entity.js";
import { Maquinaria } from "entity/maquinaria/maquinaria.entity.js";
import { CreateMaintenanceHistoryDTO, UpdateMaintenanceHistoryDTO } from "types/MachineryMaintenance/maintenanceHistory.dto.js";
import { ServiceResponse } from "../../../types.js";

export async function createMaintenanceHistory(data: CreateMaintenanceHistoryDTO): Promise<ServiceResponse<MaintenanceHistory>> {
  try {
    const repo = AppDataSource.getRepository(MaintenanceHistory);
    const maquinariaRepo = AppDataSource.getRepository(Maquinaria);

    const maquinaria = await maquinariaRepo.findOneBy({ id: data.maquinariaId });

    if (!maquinaria) {
    
        return [null, "Maquinaria no encontrada"]
    }

    const nuevo = repo.create({
      date: new Date(data.fecha),
      description: data.descripcion,
      cost: data.costo,
      responsibleMechanic: data.mecanico,
      maquinaria: maquinaria,
    });

    const saved = await repo.save(nuevo);

    return [saved, null];

  } catch (error) {

    console.error("Error al registrar mantenimiento:", error);
    return [null, "Error al registrar el historial de mantenimiento"];

  }
}

export async function getAllMaintenanceHistories(): Promise<ServiceResponse<MaintenanceHistory[]>> {
  try {
    const repo = AppDataSource.getRepository(MaintenanceHistory);
    const registros = await repo.find({ relations: ["maquinaria"] });

    if (!registros.length){

        return [null, "No hay registros de mantención"]
    }

    return [registros, null];

  } catch (error) {

    console.error("Error al obtener historiales:", error);
    return [null, "Error al obtener registros de mantenimiento"];

  }
}

export async function getMaintenanceHistory(id: number): Promise<ServiceResponse<MaintenanceHistory>> {
  try {

    const repo = AppDataSource.getRepository(MaintenanceHistory);
    const registro = await repo.findOne({ where: { id }, relations: ["maquinaria"] });

    if (!registro) {
        return [null, "Historial no encontrado"]
    }
             
    return [registro, null];

  } catch (error) {

    console.error("Error al obtener historial:", error);
    return [null, "Error al obtener historial"];

  }
}

export async function updateMaintenanceHistory(id: number, data: UpdateMaintenanceHistoryDTO): Promise<ServiceResponse<MaintenanceHistory>> {
  try {

    const repo = AppDataSource.getRepository(MaintenanceHistory);
    const registro = await repo.findOneBy({ id });


    if (!registro){
        return [null, "Jistorial no encontrado"]
    }

    if (data.fecha !== undefined){
        registro.date = new Date(data.fecha);
    }
    if (data.descripcion !== undefined){
        registro.description = data.descripcion;
    }
    if (data.costo !== undefined){
        registro.cost = data.costo;
    }
    if (data.mecanico !== undefined){
        registro.responsibleMechanic = data.mecanico;
    }

    const actualizado = await repo.save(registro);

    return [actualizado, null];

  } catch (error) {

    console.error("Error al actualizar historial:", error);
    return [null, "Error al actualizar historial"];

  }
}

export async function deleteMaintenanceHistoryService(id: number): Promise<ServiceResponse<MaintenanceHistory>> {

    try {

        const repo = AppDataSource.getRepository(MaintenanceHistory)
        const mantencion = await repo.findOneBy({ id })

        if (!mantencion){
            return [null, "Mantención no encontrada."]
        }
        await repo.remove(mantencion)
        return [mantencion, null];

    } catch (error) {
        console.error("Error al eliminar mantención:", error)
        return [null, "Error interno del servidor."]
    }
}