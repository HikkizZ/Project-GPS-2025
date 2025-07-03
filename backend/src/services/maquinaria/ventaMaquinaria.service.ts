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
    // Buscar maquinaria disponible por patente
    const maquinaria = await this.maquinariaRepository.findOne({
      where: {
        patente: ventaData.patente,
        estado: EstadoMaquinaria.DISPONIBLE, // Solo disponibles
      },
    })

    if (!maquinaria) {
      throw new Error(
        `No se encontró maquinaria disponible con patente: ${ventaData.patente}. Puede estar ya vendida o no existir.`,
      )
    }

    // Marcar maquinaria como vendida
    maquinaria.estado = EstadoMaquinaria.VENDIDA
    await this.maquinariaRepository.save(maquinaria)

    // Registrar la venta
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

  async obtenerVentasPorMaquinaria(maquinariaId: number): Promise<VentaMaquinaria[]> {
    return this.ventaRepository.find({
      where: { maquinariaId },
      relations: ["maquinaria"],
      order: { fechaVenta: "DESC" },
    })
  }

  async obtenerVentasPorPatente(patente: string): Promise<VentaMaquinaria[]> {
    return this.ventaRepository.find({
      where: { patente },
      relations: ["maquinaria"],
      order: { fechaVenta: "DESC" },
    })
  }

  async obtenerVentasPorFecha(fechaInicio: Date, fechaFin: Date): Promise<VentaMaquinaria[]> {
    return this.ventaRepository
      .createQueryBuilder("venta")
      .leftJoinAndSelect("venta.maquinaria", "maquinaria")
      .where("venta.fechaVenta >= :fechaInicio", { fechaInicio })
      .andWhere("venta.fechaVenta <= :fechaFin", { fechaFin })
      .orderBy("venta.fechaVenta", "DESC")
      .getMany()
  }

  async obtenerVentasPorComprador(comprador: string): Promise<VentaMaquinaria[]> {
    return this.ventaRepository.find({
      where: { comprador },
      relations: ["maquinaria"],
      order: { fechaVenta: "DESC" },
    })
  }

  async obtenerTotalVentasPorPeriodo(fechaInicio: Date, fechaFin: Date): Promise<number> {
    const result = await this.ventaRepository
      .createQueryBuilder("venta")
      .select("SUM(venta.valorVenta)", "total")
      .where("venta.fechaVenta >= :fechaInicio", { fechaInicio })
      .andWhere("venta.fechaVenta <= :fechaFin", { fechaFin })
      .getRawOne()

    return Number.parseFloat(result.total) || 0
  }

  async actualizarVenta(id: number, datosActualizacion: Partial<VentaMaquinaria>): Promise<VentaMaquinaria> {
    const venta = await this.obtenerVentaPorId(id)
    this.ventaRepository.merge(venta, datosActualizacion)
    return this.ventaRepository.save(venta)
  }

  async eliminarVenta(id: number): Promise<void> {
    const venta = await this.obtenerVentaPorId(id)
    await this.ventaRepository.remove(venta)
  }

  // ELIMINÉ EL MÉTODO calcularGananciaPorPatente SI NO LO NECESITAS
}
