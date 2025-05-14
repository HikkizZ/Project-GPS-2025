import type { Repository } from "typeorm"
import { EntradaInventario } from "../../entity/inventario/entradasInventario.entity.js"
import { AppDataSource } from "../../config/configDB.js"
import { InventarioService } from "./inventario.service.js"
import { ProveedorService } from "../clienteProveedor/proveedor.service.js"

interface CreateEntradaData {
  inventarioId: number
  proveedorId: number
  cantidad: number
  precioCompra: number
}

interface UpdateEntradaData {
  proveedorId?: number
  cantidad?: number
  precioCompra?: number
}

export class EntradaInventarioService {
  private entradaRepository: Repository<EntradaInventario>
  private inventarioService: InventarioService
  private proveedorService: ProveedorService

  constructor() {
    this.entradaRepository = AppDataSource.getRepository(EntradaInventario)
    this.inventarioService = new InventarioService()
    this.proveedorService = new ProveedorService()
  }

  async create(createEntradaData: CreateEntradaData): Promise<EntradaInventario> {
    // Verificar que el producto y proveedor existan
    const producto = await this.inventarioService.findOne(createEntradaData.inventarioId)
    const proveedor = await this.proveedorService.findOne(createEntradaData.proveedorId)

    // Crear la entrada
    const nuevaEntrada = this.entradaRepository.create({
      cantidad: createEntradaData.cantidad,
      precioCompra: createEntradaData.precioCompra,
      inventario: producto,
      proveedor: proveedor,
    })

    // Guardar la entrada
    const entradaGuardada = await this.entradaRepository.save(nuevaEntrada)

    // Actualizar la cantidad en inventario (sumar)
    await this.inventarioService.actualizarCantidad(createEntradaData.inventarioId, createEntradaData.cantidad)

    return entradaGuardada
  }

  async findAll(): Promise<EntradaInventario[]> {
    return this.entradaRepository.find({
      relations: ["inventario", "proveedor"],
    })
  }

  async findOne(id: number): Promise<EntradaInventario> {
    const entrada = await this.entradaRepository.findOne({
      where: { id },
      relations: ["inventario", "proveedor"],
    })

    if (!entrada) {
      throw new Error(`Entrada con ID ${id} no encontrada`)
    }

    return entrada
  }

  async update(id: number, updateEntradaData: UpdateEntradaData): Promise<EntradaInventario> {
    const entrada = await this.findOne(id)
    const diferenciaStock = updateEntradaData.cantidad ? updateEntradaData.cantidad - entrada.cantidad : 0

    // Si cambia la cantidad, actualizar el inventario
    if (diferenciaStock !== 0) {
      await this.inventarioService.actualizarCantidad(entrada.inventario.id, diferenciaStock)
    }

    // Actualizar la entrada
    if (updateEntradaData.proveedorId) {
      const proveedor = await this.proveedorService.findOne(updateEntradaData.proveedorId)
      entrada.proveedor = proveedor
    }

    if (updateEntradaData.cantidad) {
      entrada.cantidad = updateEntradaData.cantidad
    }

    if (updateEntradaData.precioCompra) {
      entrada.precioCompra = updateEntradaData.precioCompra
    }

    return this.entradaRepository.save(entrada)
  }

  async remove(id: number): Promise<void> {
    const entrada = await this.findOne(id)

    // Restar la cantidad del inventario
    await this.inventarioService.actualizarCantidad(entrada.inventario.id, -entrada.cantidad)

    await this.entradaRepository.remove(entrada)
  }

  async getEntradasByProveedor(proveedorId: number): Promise<EntradaInventario[]> {
    return this.entradaRepository.find({
      where: {
        proveedor: { id: proveedorId },
      },
      relations: ["inventario", "proveedor"],
    })
  }

  async getEntradasByProducto(inventarioId: number): Promise<EntradaInventario[]> {
    return this.entradaRepository.find({
      where: {
        inventario: { id: inventarioId },
      },
      relations: ["inventario", "proveedor"],
    })
  }

  async getEntradasByFecha(fechaInicio: Date, fechaFin: Date): Promise<EntradaInventario[]> {
    return this.entradaRepository.find({
      where: {
        fechaEntrada: {
          $gte: fechaInicio,
          $lte: fechaFin,
        } as any,
      },
      relations: ["inventario", "proveedor"],
    })
  }
}
