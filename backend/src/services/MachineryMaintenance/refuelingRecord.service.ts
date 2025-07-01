import { AppDataSource } from "config/configDB.js";
import { RefuelingRecord } from "../../entity/MachineryMaintenance/RefuelingRecord.entity.js"
import { Maquinaria } from "entity/maquinaria/maquinaria.entity.js";
import { CreateRefuelingRecordDTO, UpdateRefuelingRecordDTO } from "types/MachineryMaintenance/refuelingRecord.dto.js";
import { ServiceResponse } from "../../../types.js";


export async function createRefuelingRecord(data: CreateRefuelingRecordDTO): Promise<ServiceResponse<RefuelingRecord>> {
  
try {

    const repo = AppDataSource.getRepository(RefuelingRecord);
    const maquinariaRepo = AppDataSource.getRepository(Maquinaria);
    const maquinaria = await maquinariaRepo.findOneBy({ id: data.maquinariaId });



    if (!maquinaria){
        return [null, "Maquinaria no encontrada"];
    }

    const nuevo = repo.create({
      date: new Date(data.fecha),
      liters: data.litros,
      price: data.precio,
      operator: data.operador,
      maquinaria: maquinaria,
    });

    const saved = await repo.save(nuevo);

    return [saved, null];

  }catch (error) {

    console.error("Error al registrar repostaje:", error);
    return [null, "Error al registrar repostaje de combustible"];

  }
}

export async function getAllRefuelingRecords(): Promise<ServiceResponse<RefuelingRecord[]>> {
    
    try {

        const repo = AppDataSource.getRepository(RefuelingRecord);
        const registros = await repo.find({ relations: ["maquinaria"] });

        if (!registros.length){
            return [null, "No hay registros de repostaje"];
        }

        return [registros, null];

    } catch (error) {
        console.error("Error al obtener repostajes:", error);
        return [null, "Error al obtener repostajes"];
    }


}

export async function getRefuelingRecord(id: number): Promise<ServiceResponse<RefuelingRecord>> {

    try {
        
        const repo = AppDataSource.getRepository(RefuelingRecord);
        const registro = await repo.findOne({ where: { id }, relations: ["maquinaria"] });

        if (!registro){
            return [null, "Registro de repostaje no encontrado"];
        }

    return [registro, null];


    } catch (error) {
        console.error("Error al obtener repostaje:", error);
        return [null, "Error al obtener repostaje"];
    }


}

export async function updateRefuelingRecord(id: number, data: UpdateRefuelingRecordDTO): Promise<ServiceResponse<RefuelingRecord>> {

    try {
        
        const repo = AppDataSource.getRepository(RefuelingRecord);
        const registro = await repo.findOneBy({ id });

        if (!registro){
            return [null, "Registro no encontrado"];
        }

        if (data.fecha !== undefined){
            registro.date = new Date(data.fecha);
        }
        if (data.litros !== undefined){
            registro.liters = data.litros;
        }
        if (data.precio !== undefined){
            registro.price = data.precio;
        }
        if (data.operador !== undefined){
            registro.operator = data.operador;
        }

        const actualizado = await repo.save(registro);
        return[actualizado, null];


    } catch (error) {
        
        console.error("Error al actualizar el repostaje:    ", error);
        return[null, "Error al actualizar el repostaje:    "];
    }



}

export async function deleteRefuelingRecord(id: number): Promise<ServiceResponse<RefuelingRecord>> {

  try {

    const repo = AppDataSource.getRepository(RefuelingRecord);
    const registro = await repo.findOneBy({ id });

    if (!registro){
        return [null, "Registro no encontrado"];
    }

    await repo.remove(registro);
    return [registro, null];
    
  } catch (error) {
    console.error("Error al eliminar repostaje:", error);
    return [null, "Error al eliminar repostaje"];
  }
}