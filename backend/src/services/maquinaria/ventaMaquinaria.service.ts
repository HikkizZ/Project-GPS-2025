import type { Repository } from "typeorm"
import { VentaMaquinaria } from "../../entity/maquinaria/ventaMaquinaria.entity.js"
import { Maquinaria, EstadoMaquinaria } from "../../entity/maquinaria/maquinaria.entity.js"
import { AppDataSource } from "../../config/configDB.js"

export class VentaMaquinariaService {
  private ventaRepository: Repository<VentaMaquinaria>
  private maquinariaRepository: Repository<Maquinaria>

  constructor() {
    this.ventaRepository = AppDataSource.getRepository(VentaMaquinaria)
    this.maquinariaRepository = AppDataSource.getRepository(Maquinaria)
  }

  async registrarVenta(ventaData: {
    patente: string
    fechaVenta: Date
    valorCompra: number
    valorVenta: number
    comprador?: string
    observaciones?: string
  }): Promise<{ maquinaria: Maquinaria; venta: VentaMaquinaria }> {
    // Buscar maquinaria disponible
    const maquinaria = await this.maquinariaRepository.findOne({
      where: {
        patente: ventaData.patente,
        estado: EstadoMaquinaria.DISPONIBLE,
      },
    })

    if (!maquinaria) {
      throw new Error(`No se encontró maquinaria disponible con patente: ${ventaData.patente}`)
    }

    // Cambiar estado a vendida
    maquinaria.estado = EstadoMaquinaria.VENDIDA
    await this.maquinariaRepository.save(maquinaria)

    // Crear registro de venta
    const venta = this.ventaRepository.create({
      maquinariaId: maquinaria.id,
      patente: ventaData.patente,
      fechaVenta: ventaData.fechaVenta,
      valorCompra: ventaData.valorCompra,
      valorVenta: ventaData.valorVenta,
      comprador: ventaData.comprador,
      observaciones: ventaData.observaciones,
    })

    const ventaGuardada = await this.ventaRepository.save(venta)

    return { maquinaria, venta: ventaGuardada }
  }

  async obtenerTodasLasVentas(): Promise<VentaMaquinaria[]> {
    return this.ventaRepository.find({
      relations: ["maquinaria"],
      order: { fechaVenta: "DESC" },
    })
  }

  async obtenerVentaPorId(id: number): Promise<VentaMaquinaria> {
    const venta = await this.ventaRepository.findOne({
      where: { id },
      relations: ["maquinaria"],
    })

    if (!venta) {
      throw new Error(`Venta con ID ${id} no encontrada`)
    }

    return venta
  }

  async obtenerVentasPorPatente(patente: string): Promise<VentaMaquinaria[]> {
    return this.ventaRepository.find({
      where: { patente },
      relations: ["maquinaria"],
      order: { fechaVenta: "DESC" },
    })
  }

  async obtenerVentasPorFecha(fechaInicio: Date, fechaFin: Date): Promise<VentaMaquinaria[]> {
    return this.ventaRepository.find({
      where: {
        fechaVenta: {
          $gte: fechaInicio,
          $lte: fechaFin,
        } as any,
      },
      relations: ["maquinaria"],
      order: { fechaVenta: "DESC" },
    })
  }

  async obtenerVentasPorComprador(comprador: string): Promise<VentaMaquinaria[]> {
    return this.ventaRepository.find({
      where: { comprador },
      relations: ["maquinaria"],
      order: { fechaVenta: "DESC" },
    })
  }

}