import { AppDataSource } from "config/configDB.js";
import { ScheduledMaintenance } from "entity/MachineryMaintenance/ScheduledMaintenance.entity.js";
import { Maquinaria } from "entity/maquinaria/maquinaria.entity.js";
import { CreateScheduledMaintenanceDTO, UpdateScheduledMaintenanceDTO   } from "types/MachineryMaintenance/scheduledMaintenance.dto.js";
import { ServiceResponse } from "../../../types.js";



export async function createScheduledMaintenance(data: CreateScheduledMaintenanceDTO): Promise<ServiceResponse<ScheduledMaintenance>> {
  
    try {

        const repo = AppDataSource.getRepository(ScheduledMaintenance);
        const maquinariaRepo = AppDataSource.getRepository(Maquinaria);
        const maquinaria = await maquinariaRepo.findOneBy({ id: data.maquinariaId });

        if (!maquinaria){
            return [null, "Maquinaria no encontrada"];
        }

        const nueva = repo.create({
            scheduleDate: new Date(data.fechaProgramada),
            task: data.tarea,
            completed: false,
            maquinaria: maquinaria,
        });

        const saved = await repo.save(nueva);
        return [saved, null];

    }catch (error) {
        console.error("Error al registrar mantención programada:", error);
        return [null, "Error al registrar mantención programada"];
    }
}




export async function getAllScheduledMaintenances(): Promise<ServiceResponse<ScheduledMaintenance[]>> {

    try {

        const repo = AppDataSource.getRepository(ScheduledMaintenance);
        const registros = await repo.find({ relations: ["maquinaria"] });

        if (!registros.length){
            return [null, "No hay mantenciones programadas registradas"];
        }

        return [registros, null];

    }catch (error) {
        console.error("Error al obtener mantenciones:", error);
        return [null, "Error al obtener mantenciones programadas"];
    }
}




export async function getScheduledMaintenance(id: number): Promise<ServiceResponse<ScheduledMaintenance>> {

   try {
    
        const repo = AppDataSource.getRepository(ScheduledMaintenance);
        const registro = await repo.findOne({ where: { id }, relations: ["maquinaria"] });

        if (!registro){
            return [null, "Mantención programada no encontrada"];
        }

        return [registro, null];

    }catch (error) {
        console.error("Error al obtener mantención:", error);
        return [null, "Error al obtener mantención"];
    }
}




export async function updateScheduledMaintenance(id: number, data: UpdateScheduledMaintenanceDTO): Promise<ServiceResponse<ScheduledMaintenance>> {

    
    try {

        const repo = AppDataSource.getRepository(ScheduledMaintenance);
        const existente = await repo.findOneBy({ id });

        if (!existente){
            return [null, "Registro no encontrado"];
        }

        if (data.fechaProgramada !== undefined){
            existente.scheduleDate = new Date(data.fechaProgramada);
        }


        if (data.tarea !== undefined){
            existente.task = data.tarea;
        }

        if (data.completado !== undefined){
            existente.completed = data.completado;
        }

    const actualizado = await repo.save(existente);
    return [actualizado, null];

    }catch (error) {
        console.error("Error al actualizar mantención programada:", error);
        return [null, "Error al actualizar mantención programada"];
    }
}




export async function deleteScheduledMaintenance(id: number): Promise<ServiceResponse<ScheduledMaintenance>> {
  try {
    const repo = AppDataSource.getRepository(ScheduledMaintenance);
    const existente = await repo.findOneBy({ id });

    if (!existente) return [null, "Registro no encontrado"];

    await repo.remove(existente);
    return [existente, null];
    
  } catch (error) {
    console.error("Error al eliminar mantención programada:", error);
    return [null, "Error al eliminar mantención programada"];
  }
}