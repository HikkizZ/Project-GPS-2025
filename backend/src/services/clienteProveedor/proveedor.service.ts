import type { Repository } from "typeorm"
import { Proveedor } from "../../entity/clientesProveedores/proveedores.entity.js"
import { AppDataSource } from "../../config/configDB.js"

export class ProveedorService {
  private proveedorRepository: Repository<Proveedor>

  constructor() {
    this.proveedorRepository = AppDataSource.getRepository(Proveedor)
  }

  async create(proveedorData: Partial<Proveedor>): Promise<Proveedor> {
    // Verificar si ya existe un proveedor con el mismo RUT
    const proveedorExistente = await this.proveedorRepository.findOne({
      where: { rut: proveedorData.rut },
    })

    if (proveedorExistente) {
      throw new Error(`Ya existe un proveedor con el RUT ${proveedorData.rut}`)
    }

    try {
      // Usar directamente save en lugar de create + save
      return await this.proveedorRepository.save(proveedorData)
    } catch (error: any) {
      console.error("Error al crear proveedor:", error)
      throw new Error(`Error al crear el proveedor: ${error.message || "Error desconocido"}`)
    }
  }

  async findAll(): Promise<Proveedor[]> {
    return this.proveedorRepository.find()
  }

  async findOne(id: number): Promise<Proveedor> {
    const proveedor = await this.proveedorRepository.findOne({
      where: { id },
      relations: ["entradas"],
    })

    if (!proveedor) {
      throw new Error(`Proveedor con ID ${id} no encontrado`)
    }

    return proveedor
  }

  async findByRut(rut: string): Promise<Proveedor> {
    const proveedor = await this.proveedorRepository.findOne({
      where: { rut },
    })

    if (!proveedor) {
      throw new Error(`Proveedor con RUT ${rut} no encontrado`)
    }

    return proveedor
  }

  async update(id: number, proveedorData: Partial<Proveedor>): Promise<Proveedor> {
    const proveedor = await this.findOne(id)

    // Si se está actualizando el RUT, verificar que no exista otro proveedor con ese RUT
    if (proveedorData.rut && proveedorData.rut !== proveedor.rut) {
      const proveedorExistente = await this.proveedorRepository.findOne({
        where: { rut: proveedorData.rut },
      })

      if (proveedorExistente) {
        throw new Error(`Ya existe un proveedor con el RUT ${proveedorData.rut}`)
      }
    }

    this.proveedorRepository.merge(proveedor, proveedorData)
    return this.proveedorRepository.save(proveedor)
  }

  async remove(id: number): Promise<void> {
    const proveedor = await this.findOne(id)

    // Verificar si el proveedor tiene entradas asociadas
    if (proveedor.entradas && proveedor.entradas.length > 0) {
      throw new Error(`No se puede eliminar el proveedor porque tiene ${proveedor.entradas.length} entradas asociadas`)
    }

    await this.proveedorRepository.remove(proveedor)
  }

  async buscarPorNombre(nombre: string): Promise<Proveedor[]> {
    return this.proveedorRepository.find({
      where: {
        nombre: {
          $like: `%${nombre}%`,
        } as any,
      },
    })
  }

  async getProveedoresConMasEntradas(limite = 10): Promise<Proveedor[]> {
    return this.proveedorRepository
      .createQueryBuilder("proveedor")
      .leftJoin("proveedor.entradas", "entrada")
      .addSelect("COUNT(entrada.id)", "entradaCount")
      .groupBy("proveedor.id")
      .orderBy("entradaCount", "DESC")
      .limit(limite)
      .getMany()
  }
}
