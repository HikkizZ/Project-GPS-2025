import { AppDataSource } from "../../config/configDB.js";
import { SparePart } from "../../entity/MachineryMaintenance/SparePart.entity.js";
import { Maquinaria } from "../../entity/maquinaria/maquinaria.entity.js";
import { CreateSparePartDTO, UpdateSparePartDTO } from "types/MachineryMaintenance/sparePart.dto.js";
import { ServiceResponse } from "../../../types.js";




export async function createSparePart(data: CreateSparePartDTO): Promise<ServiceResponse<SparePart>> {
    
    try {
        const repo = AppDataSource.getRepository(SparePart);
        const maquinariaRepo = AppDataSource.getRepository(Maquinaria);
        const maquinaria = await maquinariaRepo.findOneBy({ id: data.maquinariaId });

        if (!maquinaria){
            return [null, "Maquinaria no encontrada"];
        }

        const nuevo = repo.create({
            name: data.nombre,
            stock: data.stock,
            maquinaria: maquinaria,
        });

        const saved = await repo.save(nuevo);
        return [saved, null];

    }catch (error) {
        console.error("Error al registrar repuesto:", error);
        return [null, "Error al registrar repuesto"];
    }
}




export async function getAllSpareParts(): Promise<ServiceResponse<SparePart[]>> {

    try {
        const repo = AppDataSource.getRepository(SparePart);
        const repuestos = await repo.find({ relations: ["maquinaria"] });

        if (!repuestos.length){
            return [null, "No hay repuestos registrados"];
        }

        return [repuestos, null];

    } catch (error) {
        console.error("Error al obtener repuestos:", error);
        return [null, "Error al obtener repuestos"];
    }
}





export async function getSparePart(id: number): Promise<ServiceResponse<SparePart>> {
    try {

        const repo = AppDataSource.getRepository(SparePart);
        const repuesto = await repo.findOne({ where: { id }, relations: ["maquinaria"] });

        if (!repuesto){
            return [null, "Repuesto no encontrado"];
        }
        return [repuesto, null];

    } catch (error) {
        console.error("Error al obtener repuesto:", error);
        return [null, "Error al obtener repuesto"];
    }
}




export async function updateSparePart(id: number, data: UpdateSparePartDTO): Promise<ServiceResponse<SparePart>> {
  
    try {
        const repo = AppDataSource.getRepository(SparePart);
        const existente = await repo.findOneBy({ id });

        if (!existente){
            return [null, "Repuesto no encontrado"];
        }

        if (data.nombre !== undefined){
            existente.name = data.nombre;
        }
        if (data.stock !== undefined){
            existente.stock = data.stock;
        }

        const actualizado = await repo.save(existente);
        return [actualizado, null];

    } catch (error) {
        console.error("Error al actualizar repuesto:", error);
        return [null, "Error al actualizar repuesto"];
    }
}





export async function deleteSparePart(id: number): Promise<ServiceResponse<SparePart>> {
  
    try {
        const repo = AppDataSource.getRepository(SparePart);
        const existente = await repo.findOneBy({ id });

        if (!existente) return [null, "Repuesto no encontrado"];

        await repo.remove(existente);
        return [existente, null];

    } catch (error) {
        console.error("Error al eliminar repuesto:", error);
        return [null, "Error al eliminar repuesto"];
    }
}
