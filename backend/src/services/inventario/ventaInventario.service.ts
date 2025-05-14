import type { Repository } from "typeorm"
import { VentaInventario } from "../../entity/inventario/ventasInventario.entity.js"
import { AppDataSource } from "../../config/configDB.js"
import { InventarioService } from "./inventario.service.js"
import { ClienteService } from "../clienteProveedor/cliente.service.js"

interface CreateVentaData {
  inventarioId: number
  clienteId: number
  cantidad: number
  precioVenta?: number
}

interface UpdateVentaData {
  clienteId?: number
  cantidad?: number
  precioVenta?: number
}

export class VentaInventarioService {
  private ventaRepository: Repository<VentaInventario>
  private inventarioService: InventarioService
  private clienteService: ClienteService

  constructor() {
    this.ventaRepository = AppDataSource.getRepository(VentaInventario)
    this.inventarioService = new InventarioService()
    this.clienteService = new ClienteService()
  }

  async create(createVentaData: CreateVentaData): Promise<VentaInventario> {
    // Verificar que el producto y cliente existan
    const producto = await this.inventarioService.findOne(createVentaData.inventarioId)
    const cliente = await this.clienteService.findOne(createVentaData.clienteId)

    // Verificar que haya suficiente stock
    if (producto.cantidadDisponible < createVentaData.cantidad) {
      throw new Error(
        `Stock insuficiente para el producto ${producto.nombreProducto}. Disponible: ${producto.cantidadDisponible}`,
      )
    }

    // Crear la venta
    const nuevaVenta = this.ventaRepository.create({
      cantidad: createVentaData.cantidad,
      precioVenta: createVentaData.precioVenta || producto.precioVenta,
      inventario: producto,
      cliente: cliente,
    })

    // Guardar la venta
    const ventaGuardada = await this.ventaRepository.save(nuevaVenta)

    // Actualizar la cantidad en inventario (restar)
    await this.inventarioService.actualizarCantidad(createVentaData.inventarioId, -createVentaData.cantidad)

    return ventaGuardada
  }

  async findAll(): Promise<VentaInventario[]> {
    return this.ventaRepository.find({
      relations: ["inventario", "cliente"],
    })
  }

  async findOne(id: number): Promise<VentaInventario> {
    const venta = await this.ventaRepository.findOne({
      where: { id },
      relations: ["inventario", "cliente"],
    })

    if (!venta) {
      throw new Error(`Venta con ID ${id} no encontrada`)
    }

    return venta
  }

  async update(id: number, updateVentaData: UpdateVentaData): Promise<VentaInventario> {
    const venta = await this.findOne(id)
    const diferenciaStock = updateVentaData.cantidad ? updateVentaData.cantidad - venta.cantidad : 0

    // Si cambia la cantidad, actualizar el inventario
    if (diferenciaStock !== 0) {
      // Verificar stock si se aumenta la cantidad
      if (diferenciaStock > 0) {
        const producto = await this.inventarioService.findOne(venta.inventario.id)
        if (producto.cantidadDisponible < diferenciaStock) {
          throw new Error(`Stock insuficiente para aumentar la venta. Disponible: ${producto.cantidadDisponible}`)
        }
      }

      // Actualizar inventario (restar la diferencia)
      await this.inventarioService.actualizarCantidad(venta.inventario.id, -diferenciaStock)
    }

    // Actualizar la venta
    if (updateVentaData.clienteId) {
      const cliente = await this.clienteService.findOne(updateVentaData.clienteId)
      venta.cliente = cliente
    }

    if (updateVentaData.cantidad) {
      venta.cantidad = updateVentaData.cantidad
    }

    if (updateVentaData.precioVenta) {
      venta.precioVenta = updateVentaData.precioVenta
    }

    return this.ventaRepository.save(venta)
  }

  async remove(id: number): Promise<void> {
    const venta = await this.findOne(id)

    // Devolver la cantidad al inventario
    await this.inventarioService.actualizarCantidad(venta.inventario.id, venta.cantidad)

    await this.ventaRepository.remove(venta)
  }

  async getVentasByCliente(clienteId: number): Promise<VentaInventario[]> {
    return this.ventaRepository.find({
      where: {
        cliente: { id: clienteId },
      },
      relations: ["inventario", "cliente"],
    })
  }

  async getVentasByProducto(inventarioId: number): Promise<VentaInventario[]> {
    return this.ventaRepository.find({
      where: {
        inventario: { id: inventarioId },
      },
      relations: ["inventario", "cliente"],
    })
  }

  async getVentasByFecha(fechaInicio: Date, fechaFin: Date): Promise<VentaInventario[]> {
    return this.ventaRepository.find({
      where: {
        fechaVenta: {
          $gte: fechaInicio,
          $lte: fechaFin,
        } as any,
      },
      relations: ["inventario", "cliente"],
    })
  }

  async getTotalVentas(fechaInicio?: Date, fechaFin?: Date): Promise<number> {
    const query = this.ventaRepository
      .createQueryBuilder("venta")
      .select("SUM(venta.cantidad * venta.precioVenta)", "total")

    if (fechaInicio && fechaFin) {
      query.where("venta.fechaVenta BETWEEN :fechaInicio AND :fechaFin", {
        fechaInicio,
        fechaFin,
      })
    }

    const result = await query.getRawOne()
    return result.total || 0
  }
}
