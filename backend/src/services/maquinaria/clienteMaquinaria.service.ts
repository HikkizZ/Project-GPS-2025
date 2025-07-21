import type { Repository } from "typeorm"
import { ClienteMaquinaria } from "../../entity/maquinaria/clienteMaquinaria.entity.js"
import { AppDataSource } from "../../config/configDB.js"
import { limpiarRut } from "../../utils/rutValidator.js"

export class ClienteMaquinariaService {
  private clienteMaquinariaRepository: Repository<ClienteMaquinaria>

  constructor() {
    this.clienteMaquinariaRepository = AppDataSource.getRepository(ClienteMaquinaria)
  }

  async create(clienteData: Partial<ClienteMaquinaria>): Promise<ClienteMaquinaria> {
    if (clienteData.rut) {
      clienteData.rut = limpiarRut(clienteData.rut)
    }

    // Verificar RUT único
    const existingCliente = await this.clienteMaquinariaRepository.findOne({
      where: { rut: clienteData.rut },
    })

    if (existingCliente) {
      throw new Error("Ya existe un cliente con este RUT")
    }

    const nuevoCliente = this.clienteMaquinariaRepository.create(clienteData)
    return this.clienteMaquinariaRepository.save(nuevoCliente)
  }

  async findAll(): Promise<ClienteMaquinaria[]> {
    return this.clienteMaquinariaRepository.find({
      order: { nombre: "ASC" },
    })
  }

  async findOne(id: number): Promise<ClienteMaquinaria> {
    const cliente = await this.clienteMaquinariaRepository.findOne({
      where: { id },
    })

    if (!cliente) {
      throw new Error(`Cliente con ID ${id} no encontrado`)
    }

    return cliente
  }

  async findByRut(rut: string): Promise<ClienteMaquinaria> {
    const rutLimpio = limpiarRut(rut)
    const cliente = await this.clienteMaquinariaRepository.findOne({
      where: { rut: rutLimpio },
    })

    if (!cliente) {
      throw new Error(`Cliente con RUT ${rut} no encontrado`)
    }

    return cliente
  }

  async update(id: number, clienteData: Partial<ClienteMaquinaria>): Promise<ClienteMaquinaria> {
    const cliente = await this.findOne(id)

    if (clienteData.rut) {
      clienteData.rut = limpiarRut(clienteData.rut)
    }

    Object.assign(cliente, clienteData)
    return this.clienteMaquinariaRepository.save(cliente)
  }

  async remove(id: number): Promise<void> {
    const cliente = await this.findOne(id)
    await this.clienteMaquinariaRepository.remove(cliente)
  }

  async searchByName(nombre: string): Promise<ClienteMaquinaria[]> {
    return this.clienteMaquinariaRepository.find({
      where: { nombre: `%${nombre}%` as any },
      order: { nombre: "ASC" },
    })
  }
}
