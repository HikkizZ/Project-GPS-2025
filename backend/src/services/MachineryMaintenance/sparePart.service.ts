import { AppDataSource } from "../../config/configDB.js";
import { SparePart } from "../../entity/MachineryMaintenance/SparePart.entity.js";
import { CreateSparePartDTO, UpdateSparePartDTO } from "../../types/MachineryMaintenance/sparePart.dto.js";
import { ServiceResponse } from "../../../types.js";


function contieneCaracteresEspeciales(texto: string): boolean {
  const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s().-]+$/;
  return !regex.test(texto);
}

// Crear repuesto
export async function createSparePart(data: CreateSparePartDTO): Promise<ServiceResponse<SparePart>> {
  try {
    const repo = AppDataSource.getRepository(SparePart);

    if (
        contieneCaracteresEspeciales(data.name) ||
        contieneCaracteresEspeciales(data.marca) ||
        contieneCaracteresEspeciales(data.modelo)
      ) {
        return [null, "No se permiten caracteres especiales en nombre, marca o modelo"];
      }

    const duplicado = await repo
      .createQueryBuilder("repuesto")
      .where("LOWER(repuesto.name) = LOWER(:name)", { name: data.name.trim() })
      .andWhere("LOWER(repuesto.marca) = LOWER(:marca)", { marca: data.marca.trim() })
      .andWhere("LOWER(repuesto.modelo) = LOWER(:modelo)", { modelo: data.modelo.trim() })
      .getOne();

   if (duplicado) {
    if (!duplicado.isActive) {
      duplicado.isActive = true;
      duplicado.stock = data.stock;
      return [await repo.save(duplicado), null];
    }

    return [null, "Ya existe un repuesto con ese nombre, marca y modelo"];
  }

    if (data.stock < 0) {
      return [null, "El stock no puede ser negativo"];
    }

    if (data.anio < 2000 || data.anio > new Date().getFullYear()) {
      return [null, `El año debe estar entre 2000 y ${new Date().getFullYear()}`];
    }

    const nuevo = repo.create({
      name: data.name.trim(),
      stock: data.stock,
      marca: data.marca.trim(),
      modelo: data.modelo.trim(),
      anio: data.anio,
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
    const repuestos = await repo.find({
      where: { isActive: true }
    });

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
    const repuesto = await repo.findOneBy({ id, isActive: true });

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

    // Validaciones solo si se intenta modificar los campos
    if (data.name !== undefined) {
      const nombre = data.name.trim();
      if (contieneCaracteresEspeciales(nombre)) {
        return [null, "No se permiten caracteres especiales en el nombre"];
      }

      const duplicado = await repo.findOne({
        where: { name: nombre },
      });

      if (duplicado && duplicado.id !== id) {
        return [null, "Ya existe un repuesto con ese nombre en ese grupo"];
      }

      existente.name = nombre;
    }

    if (data.marca !== undefined) {
      const marca = data.marca.trim();
      if (contieneCaracteresEspeciales(marca)) {
        return [null, "No se permiten caracteres especiales en la marca"];
      }
      existente.marca = marca;
    }

    if (data.modelo !== undefined) {
      const modelo = data.modelo.trim();
      if (contieneCaracteresEspeciales(modelo)) {
        return [null, "No se permiten caracteres especiales en el modelo"];
      }
      existente.modelo = modelo;
    }

    if (data.stock !== undefined) {
      if (data.stock <= 0) {
        return [null, "La cantidad de stock debe ser mayor que cero"];
      }

      if (data.modo === 'agregarStock') {
        existente.stock += data.stock;
      } else {
        existente.stock = data.stock; 
      }
    }


    if (data.anio !== undefined) {
      const anioActual = new Date().getFullYear();
      if (data.anio < 2000 || data.anio > anioActual) {
        return [null, `El año debe estar entre 2000 y ${anioActual}`];
      }
      existente.anio = data.anio;
    }

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

    existente.isActive = false;
    const actualizado = await repo.save(existente);

    return [actualizado, null];
  } catch (error) {
    console.error("Error al eliminar repuesto:", error);
    return [null, "Error al eliminar repuesto"];
  }
}
