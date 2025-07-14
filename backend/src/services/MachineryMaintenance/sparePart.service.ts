import { AppDataSource } from "../../config/configDB.js";
import { SparePart } from "../../entity/MachineryMaintenance/SparePart.entity.js";
import { CreateSparePartDTO, UpdateSparePartDTO } from "../../types/MachineryMaintenance/sparePart.dto.js";
import { ServiceResponse } from "../../../types.js";

// Crear repuesto
export async function createSparePart(data: CreateSparePartDTO): Promise<ServiceResponse<SparePart>> {
  try {
    const repo = AppDataSource.getRepository(SparePart);

    const nuevo = repo.create({
      name: data.nombre,
      stock: data.stock,
      marca: data.marca,
      modelo: data.modelo,
      anio: data.anio,
      grupo: data.grupo
    });

    const saved = await repo.save(nuevo);
    return [saved, null];

  } catch (error) {
    console.error("Error al registrar repuesto:", error);
    return [null, "Error al registrar repuesto"];
  }
}

// Obtener todos los repuestos
export async function getAllSpareParts(): Promise<ServiceResponse<SparePart[]>> {
  try {
    const repo = AppDataSource.getRepository(SparePart);
    const repuestos = await repo.find();

    if (!repuestos.length) {
      return [null, "No hay repuestos registrados"];
    }

    return [repuestos, null];

  } catch (error) {
    console.error("Error al obtener repuestos:", error);
    return [null, "Error al obtener repuestos"];
  }
}

// Obtener un repuesto por ID
export async function getSparePart(id: number): Promise<ServiceResponse<SparePart>> {
  try {
    const repo = AppDataSource.getRepository(SparePart);
    const repuesto = await repo.findOneBy({ id });

    if (!repuesto) {
      return [null, "Repuesto no encontrado"];
    }

    return [repuesto, null];

  } catch (error) {
    console.error("Error al obtener repuesto:", error);
    return [null, "Error al obtener repuesto"];
  }
}

// Actualizar un repuesto
export async function updateSparePart(id: number, data: UpdateSparePartDTO): Promise<ServiceResponse<SparePart>> {
  try {
    const repo = AppDataSource.getRepository(SparePart);
    const existente = await repo.findOneBy({ id });

    if (!existente) {
      return [null, "Repuesto no encontrado"];
    }

    if (data.nombre !== undefined) existente.name = data.nombre;
    if (data.stock !== undefined) existente.stock = data.stock;
    if (data.marca !== undefined) existente.marca = data.marca;
    if (data.modelo !== undefined) existente.modelo = data.modelo;
    if (data.anio !== undefined) existente.anio = data.anio;
    if (data.grupo !== undefined) existente.grupo = data.grupo;

    const actualizado = await repo.save(existente);
    return [actualizado, null];

  } catch (error) {
    console.error("Error al actualizar repuesto:", error);
    return [null, "Error al actualizar repuesto"];
  }
}

// Eliminar repuesto
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
