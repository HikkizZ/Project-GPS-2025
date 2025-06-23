import type { Repository } from "typeorm"
import { CompraMaquinaria } from "../../entity/maquinaria/compraMaquinaria.entity.js"
import { Maquinaria, EstadoMaquinaria, type GrupoMaquinaria } from "../../entity/maquinaria/maquinaria.entity.js"
import { AppDataSource } from "../../config/configDB.js"

export class CompraMaquinariaService {
  private compraRepository: Repository<CompraMaquinaria>
  private maquinariaRepository: Repository<Maquinaria>

  constructor() {
    this.compraRepository = AppDataSource.getRepository(CompraMaquinaria)
    this.maquinariaRepository = AppDataSource.getRepository(Maquinaria)
  }

  async registrarCompra(compraData: {
    patente: string
    grupo: GrupoMaquinaria
    marca: string
    modelo: string
    año: number
    fechaCompra: Date
    valorCompra: number
    avaluoFiscal: number
    numeroChasis: string
    kilometrajeInicial: number
    kilometrajeActual: number
    proveedor?: string
    observaciones?: string
  }): Promise<{ maquinaria: Maquinaria; compra: CompraMaquinaria }> {
    // Verificar que el número de chasis no exista
    const existeChasis = await this.maquinariaRepository.findOne({
      where: { numeroChasis: compraData.numeroChasis },
    })

    if (existeChasis) {
      throw new Error(`Ya existe una maquinaria con el número de chasis: ${compraData.numeroChasis}`)
    }

    // 1. Crear la maquinaria automáticamente
    const nuevaMaquinaria = this.maquinariaRepository.create({
      patente: compraData.patente,
      grupo: compraData.grupo,
      marca: compraData.marca,
      modelo: compraData.modelo,
      año: compraData.año,
      fechaCompra: compraData.fechaCompra,
      valorCompra: compraData.valorCompra,
      avaluoFiscal: compraData.avaluoFiscal,
      numeroChasis: compraData.numeroChasis,
      kilometrajeInicial: compraData.kilometrajeInicial,
      kilometrajeActual: compraData.kilometrajeActual,
      estado: EstadoMaquinaria.DISPONIBLE,
    })

    const maquinariaGuardada = await this.maquinariaRepository.save(nuevaMaquinaria)

    // 2. Registrar la compra con todos los datos
    const compra = this.compraRepository.create({
      maquinariaId: maquinariaGuardada.id,
      patente: compraData.patente,
      grupo: compraData.grupo,
      marca: compraData.marca,
      modelo: compraData.modelo,
      año: compraData.año,
      fechaCompra: compraData.fechaCompra,
      valorCompra: compraData.valorCompra,
      avaluoFiscal: compraData.avaluoFiscal,
      numeroChasis: compraData.numeroChasis,
      kilometrajeInicial: compraData.kilometrajeInicial,
      kilometrajeActual: compraData.kilometrajeActual,
      proveedor: compraData.proveedor,
      observaciones: compraData.observaciones,
    })

    const compraGuardada = await this.compraRepository.save(compra)

    return { maquinaria: maquinariaGuardada, compra: compraGuardada }
  }

  async obtenerTodasLasCompras(): Promise<CompraMaquinaria[]> {
    return this.compraRepository.find({
      relations: ["maquinaria"],
      order: { fechaCompra: "DESC" },
    })
  }

  async obtenerCompraPorId(id: number): Promise<CompraMaquinaria> {
    const compra = await this.compraRepository.findOne({
      where: { id },
      relations: ["maquinaria"],
    })

    if (!compra) {
      throw new Error(`Compra con ID ${id} no encontrada`)
    }

    return compra
  }

  async obtenerComprasPorMaquinaria(maquinariaId: number): Promise<CompraMaquinaria[]> {
    return this.compraRepository.find({
      where: { maquinariaId },
      relations: ["maquinaria"],
      order: { fechaCompra: "DESC" },
    })
  }

  async obtenerComprasPorPatente(patente: string): Promise<CompraMaquinaria[]> {
    return this.compraRepository.find({
      where: { patente },
      relations: ["maquinaria"],
      order: { fechaCompra: "DESC" },
    })
  }

  async obtenerComprasPorFecha(fechaInicio: Date, fechaFin: Date): Promise<CompraMaquinaria[]> {
    return this.compraRepository.find({
      where: {
        fechaCompra: {
          $gte: fechaInicio,
          $lte: fechaFin,
        } as any,
      },
      relations: ["maquinaria"],
      order: { fechaCompra: "DESC" },
    })
  }

  async obtenerComprasPorProveedor(proveedor: string): Promise<CompraMaquinaria[]> {
    return this.compraRepository.find({
      where: { proveedor },
      relations: ["maquinaria"],
      order: { fechaCompra: "DESC" },
    })
  }

  async obtenerTotalComprasPorPeriodo(fechaInicio: Date, fechaFin: Date): Promise<number> {
    const result = await this.compraRepository
      .createQueryBuilder("compra")
      .select("SUM(compra.valorCompra)", "total")
      .where("compra.fechaCompra >= :fechaInicio", { fechaInicio })
      .andWhere("compra.fechaCompra <= :fechaFin", { fechaFin })
      .getRawOne()

    return Number.parseFloat(result.total) || 0
  }

  async actualizarCompra(id: number, datosActualizacion: Partial<CompraMaquinaria>): Promise<CompraMaquinaria> {
    const compra = await this.obtenerCompraPorId(id)
    this.compraRepository.merge(compra, datosActualizacion)
    return this.compraRepository.save(compra)
  }

  async eliminarCompra(id: number): Promise<void> {
    const compra = await this.obtenerCompraPorId(id)
    await this.compraRepository.remove(compra)
  }
}
