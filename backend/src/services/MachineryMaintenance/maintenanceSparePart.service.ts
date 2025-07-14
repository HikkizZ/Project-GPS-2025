import { AppDataSource } from "../../config/configDB.js";
import { MaintenanceSparePart } from "../../entity/MachineryMaintenance/maintenanceSparePart.entity.js";
import { SparePart } from "../../entity/MachineryMaintenance/SparePart.entity.js"
import { MaintenanceRecord } from "../../entity/MachineryMaintenance/maintenanceRecord.entity.js";
import { CreateMaintenanceSparePartDTO, UpdateMaintenanceSparePartDTO } from "../../types/MachineryMaintenance/maintenanceSparePart.dto.js";
import { ServiceResponse } from "../../../types.js";

// Crear un nuevo repuesto usado en una mantención
export async function createMaintenanceSparePart(data: CreateMaintenanceSparePartDTO): Promise<ServiceResponse<MaintenanceSparePart>> {
  try {
    const mspRepo = AppDataSource.getRepository(MaintenanceSparePart);
    const spareRepo = AppDataSource.getRepository(SparePart);
    const recordRepo = AppDataSource.getRepository(MaintenanceRecord);

    const mantencion = await recordRepo.findOneBy({ id: data.mantencionId });
    if (!mantencion) return [null, "Mantención no encontrada"];

    const repuesto = await spareRepo.findOneBy({ id: data.repuestoId });
    if (!repuesto) return [null, "Repuesto no encontrado"];

    if (repuesto.stock < data.cantidadUtilizada) {
      return [null, `Stock insuficiente. Solo quedan ${repuesto.stock} unidades de ${repuesto.name}`];
    }

    // Descontar del stock
    repuesto.stock -= data.cantidadUtilizada;
    await spareRepo.save(repuesto);

    // Registrar uso
    const nuevo = mspRepo.create({
      mantencion,
      repuesto,
      cantidadUtilizada: data.cantidadUtilizada
    });

    const guardado = await mspRepo.save(nuevo);
    return [guardado, null];

  } catch (error) {
    console.error("Error al registrar repuesto utilizado:", error);
    return [null, "Error interno al registrar el repuesto en mantención"];
  }
}

// Actualizar la cantidad utilizada 
export async function updateMaintenanceSparePart(id: number, data: UpdateMaintenanceSparePartDTO): Promise<ServiceResponse<MaintenanceSparePart>> {
  try {
    const mspRepo = AppDataSource.getRepository(MaintenanceSparePart);
    const spareRepo = AppDataSource.getRepository(SparePart);

    const existente = await mspRepo.findOne({
      where: { id },
      relations: ["repuesto"]
    });

    if (!existente) return [null, "Registro no encontrado"];

    if (data.cantidadUtilizada !== undefined) {
      const diferencia = data.cantidadUtilizada - existente.cantidadUtilizada;

      // Ajustar el stock del repuesto según la diferencia
      const repuesto = existente.repuesto;
      if (repuesto.stock < diferencia) {
        return [null, `Stock insuficiente para ajustar. Solo hay ${repuesto.stock} unidades disponibles.`];
      }

      repuesto.stock -= diferencia;
      await spareRepo.save(repuesto);

      existente.cantidadUtilizada = data.cantidadUtilizada;
    }

    const actualizado = await mspRepo.save(existente);
    return [actualizado, null];

  } catch (error) {
    console.error("Error al actualizar la relación repuesto-mantención:", error);
    return [null, "Error interno al actualizar la cantidad utilizada"];
  }
}



// Eliminar un repuesto utilizado y devolver su stock
export async function deleteMaintenanceSparePart(id: number): Promise<ServiceResponse<MaintenanceSparePart>> {
  try {
    const mspRepo = AppDataSource.getRepository(MaintenanceSparePart);
    const spareRepo = AppDataSource.getRepository(SparePart);

    const usado = await mspRepo.findOne({
      where: { id },
      relations: ['repuesto']
    });

    if (!usado) return [null, "Repuesto en mantención no encontrado"];

    // Devolver la cantidad al stock original
    usado.repuesto.stock += usado.cantidadUtilizada;
    await spareRepo.save(usado.repuesto);

    // Eliminar el registro del uso
    await mspRepo.remove(usado);

    return [usado, null];

  } catch (error) {
    console.error("Error al eliminar uso de repuesto:", error);
    return [null, "Error interno al eliminar el uso de repuesto"];
  }
}


export async function getAllMaintenanceSpareParts(): Promise<ServiceResponse<MaintenanceSparePart[]>> {
  try {
    const repo = AppDataSource.getRepository(MaintenanceSparePart);

    const registros = await repo.find({
      relations: ["repuesto", "mantencion", "mantencion.maquinaria", "mantencion.mecanicoAsignado"]
    });

    if (!registros.length) return [null, "No hay repuestos utilizados registrados"];
    return [registros, null];

  } catch (error) {
    console.error("Error al obtener todos los repuestos utilizados:", error);
    return [null, "Error interno al obtener los registros"];
  }
}


export async function getMaintenanceSparePart(id: number): Promise<ServiceResponse<MaintenanceSparePart>> {
  try {
    const repo = AppDataSource.getRepository(MaintenanceSparePart);

    const registro = await repo.findOne({
      where: { id },
      relations: ["repuesto", "mantencion", "mantencion.maquinaria", "mantencion.mecanicoAsignado"]
    });

    if (!registro) return [null, "Repuesto utilizado no encontrado"];
    return [registro, null];

  } catch (error) {
    console.error("Error al obtener repuesto utilizado por ID:", error);
    return [null, "Error interno"];
  }
}
