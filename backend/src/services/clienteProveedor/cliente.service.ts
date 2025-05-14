import type { Repository } from "typeorm"
import { Cliente } from "../../entity/clientesProveedores/clientes.entity.js"
import { AppDataSource } from "../../config/configDB.js"

export class ClienteService {
  private clienteRepository: Repository<Cliente>

  constructor() {
    this.clienteRepository = AppDataSource.getRepository(Cliente)
  }

  async create(clienteData: Partial<Cliente>): Promise<Cliente> {
    // Verificar si ya existe un cliente con el mismo RUT
    const clienteExistente = await this.clienteRepository.findOne({
      where: { rut: clienteData.rut },
    })

    if (clienteExistente) {
      throw new Error(`Ya existe un cliente con el RUT ${clienteData.rut}`)
    }

    try {
      // Usar directamente save en lugar de create + save
      return await this.clienteRepository.save(clienteData)
    } catch (error: any) {
      console.error("Error al crear cliente:", error)
      throw new Error(`Error al crear el cliente: ${error.message || "Error desconocido"}`)
    }
  }

  async findAll(): Promise<Cliente[]> {
    return this.clienteRepository.find()
  }

  async findOne(id: number): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { id },
      relations: ["ventas"],
    })

    if (!cliente) {
      throw new Error(`Cliente con ID ${id} no encontrado`)
    }

    return cliente
  }

  async findByRut(rut: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { rut },
    })

    if (!cliente) {
      throw new Error(`Cliente con RUT ${rut} no encontrado`)
    }

    return cliente
  }

  async update(id: number, clienteData: Partial<Cliente>): Promise<Cliente> {
    const cliente = await this.findOne(id)

    // Si se está actualizando el RUT, verificar que no exista otro cliente con ese RUT
    if (clienteData.rut && clienteData.rut !== cliente.rut) {
      const clienteExistente = await this.clienteRepository.findOne({
        where: { rut: clienteData.rut },
      })

      if (clienteExistente) {
        throw new Error(`Ya existe un cliente con el RUT ${clienteData.rut}`)
      }
    }

    this.clienteRepository.merge(cliente, clienteData)
    return this.clienteRepository.save(cliente)
  }

  async remove(id: number): Promise<void> {
    const cliente = await this.findOne(id)

    // Verificar si el cliente tiene ventas asociadas
    if (cliente.ventas && cliente.ventas.length > 0) {
      throw new Error(`No se puede eliminar el cliente porque tiene ${cliente.ventas.length} ventas asociadas`)
    }

    await this.clienteRepository.remove(cliente)
  }

  async buscarPorNombre(nombre: string): Promise<Cliente[]> {
    return this.clienteRepository.find({
      where: {
        nombre: {
          $like: `%${nombre}%`,
        } as any,
      },
    })
  }
}
