import type { Repository } from "typeorm"
import { Maquinaria } from "../../entity/maquinaria/maquinaria.entity.js"
import { VentaMaquinaria } from "../../entity/maquinaria/ventaMaquinaria.entity.js"

export class VentaService {
  constructor(
    private maquinariaRepository: Repository<Maquinaria>,
    private ventaRepository: Repository<VentaMaquinaria>,
  ) {}

  /**
   * Transfiere una maquinaria del inventario al módulo de ventas
   */
  async transferirAVentas(maquinariaId: number, valorVenta: number): Promise<VentaMaquinaria> {
    const maquinaria = await this.maquinariaRepository.findOne({
      where: { id: maquinariaId },
      relations: ["conductores"],
    })

    if (!maquinaria) {
      throw new Error("Maquinaria no encontrada")
    }

    // Crear registro en ventas
    const ventaMaquinaria = new VentaMaquinaria()

    // Copiar todos los campos
    ventaMaquinaria.patente = maquinaria.patente
    ventaMaquinaria.grupo = maquinaria.grupo
    ventaMaquinaria.marca = maquinaria.marca
    ventaMaquinaria.modelo = maquinaria.modelo
    ventaMaquinaria.año = maquinaria.año
    ventaMaquinaria.fechaCompra = maquinaria.fechaCompra
    ventaMaquinaria.valorCompra = maquinaria.valorCompra
    ventaMaquinaria.avaluoFiscal = maquinaria.avaluoFiscal
    ventaMaquinaria.numeroChasis = maquinaria.numeroChasis
    ventaMaquinaria.kilometrajeInicial = maquinaria.kilometrajeInicial
    ventaMaquinaria.kilometrajeActual = maquinaria.kilometrajeActual

    // Campos específicos de venta
    ventaMaquinaria.valorVenta = valorVenta
    ventaMaquinaria.maquinariaOriginalId = maquinaria.id
    ventaMaquinaria.fechaPublicacion = new Date()

    // Guardar en ventas
    const ventaGuardada = await this.ventaRepository.save(ventaMaquinaria)

    // Eliminar de inventario
    await this.maquinariaRepository.remove(maquinaria)

    return ventaGuardada
  }

  /**
   * Cancela una venta y devuelve la maquinaria al inventario
   */
  async cancelarVenta(ventaId: number): Promise<Maquinaria> {
    const venta = await this.ventaRepository.findOne({
      where: { id: ventaId },
    })

    if (!venta) {
      throw new Error("Venta no encontrada")
    }

    if (venta.estadoVenta === "vendida") {
      throw new Error("No se puede cancelar una venta completada")
    }

    // Recrear maquinaria en inventario
    const maquinaria = new Maquinaria()

    maquinaria.patente = venta.patente
    maquinaria.grupo = venta.grupo
    maquinaria.marca = venta.marca
    maquinaria.modelo = venta.modelo
    maquinaria.año = venta.año
    maquinaria.fechaCompra = venta.fechaCompra
    maquinaria.valorCompra = venta.valorCompra
    maquinaria.avaluoFiscal = venta.avaluoFiscal
    maquinaria.numeroChasis = venta.numeroChasis
    maquinaria.kilometrajeInicial = venta.kilometrajeInicial
    maquinaria.kilometrajeActual = venta.kilometrajeActual

    const maquinariaGuardada = await this.maquinariaRepository.save(maquinaria)
    await this.ventaRepository.remove(venta)

    return maquinariaGuardada
  }

  /**
   * Completa una venta
   */
  async completarVenta(
    ventaId: number,
    datosComprador: {
      nombre: string
      rut?: string
      direccion?: string
      telefono?: string
      metodoPago?: string
      numeroFactura?: string
      observaciones?: string
    },
  ): Promise<VentaMaquinaria> {
    const venta = await this.ventaRepository.findOne({
      where: { id: ventaId },
    })

    if (!venta) {
      throw new Error("Venta no encontrada")
    }

    venta.estadoVenta = "vendida"
    venta.fechaVenta = new Date()
    venta.nombreComprador = datosComprador.nombre
    venta.rutComprador = datosComprador.rut
    venta.direccionComprador = datosComprador.direccion
    venta.telefonoComprador = datosComprador.telefono
    venta.metodoPago = datosComprador.metodoPago
    venta.numeroFacturaVenta = datosComprador.numeroFactura
    venta.observacionesVenta = datosComprador.observaciones

    return await this.ventaRepository.save(venta)
  }

  /**
   * Obtiene todas las maquinarias disponibles para venta
   */
  async obtenerVentasDisponibles(): Promise<VentaMaquinaria[]> {
    return await this.ventaRepository.find({
      where: { estadoVenta: "disponible" },
      order: { fechaPublicacion: "DESC" },
    })
  }

  /**
   * Obtiene el historial de ventas completadas
   */
  async obtenerHistorialVentas(): Promise<VentaMaquinaria[]> {
    return await this.ventaRepository.find({
      where: { estadoVenta: "vendida" },
      order: { fechaVenta: "DESC" },
    })
  }
}
