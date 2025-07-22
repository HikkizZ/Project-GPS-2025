import type { Repository } from "typeorm"
import { AppDataSource } from "../../config/configDB.js"
import { CompraMaquinaria } from "../../entity/maquinaria/compraMaquinaria.entity.js"
import { Maquinaria } from "../../entity/maquinaria/maquinaria.entity.js"
import type {
  CreateCompraMaquinaria,
  UpdateCompraMaquinaria,
  CreateCompraMaquinariaData,
} from "../../types/maquinaria/maquinaria.types.js"
import { MaquinariaFileUploadService } from "../fileUpload.service.js"
import type { Express } from "express"

export class CompraMaquinariaService {
  private compraMaquinariaRepository: Repository<CompraMaquinaria>
  private maquinariaRepository: Repository<Maquinaria>

  constructor() {
    this.compraMaquinariaRepository = AppDataSource.getRepository(CompraMaquinaria)
    this.maquinariaRepository = AppDataSource.getRepository(Maquinaria)
  }

  async registrarCompra(
    data: CreateCompraMaquinaria,
    file?: Express.Multer.File,
  ): Promise<{ maquinaria: Maquinaria; compra: CompraMaquinaria }> {
    // Verificar patente única
    const maquinariaExistente = await this.maquinariaRepository.findOne({
      where: { patente: data.patente },
    })

    if (maquinariaExistente) {
      throw new Error(`Ya existe una maquinaria con la patente ${data.patente}`)
    }

    // Crear maquinaria
    const nuevaMaquinaria = this.maquinariaRepository.create({
      patente: data.patente,
      grupo: data.grupo,
      marca: data.marca,
      modelo: data.modelo,
      año: data.anio,
      fechaCompra: new Date(data.fechaCompra),
      valorCompra: data.valorCompra,
      avaluoFiscal: data.avaluoFiscal,
      numeroChasis: data.numeroChasis,
      kilometrajeInicial: data.kilometrajeInicial || 0,
      kilometrajeActual: data.kilometrajeInicial || 0,
      estado: "disponible" as any,
    })

    const maquinariaGuardada = await this.maquinariaRepository.save(nuevaMaquinaria)

    // Preparar datos de compra
    const compraData: CreateCompraMaquinariaData = {
      ...data,
      maquinaria_id: maquinariaGuardada.id,
    }

    // Procesar archivo si existe
    if (file) {
      const uploadResult = await MaquinariaFileUploadService.uploadFile(file)
      compraData.padronUrl = uploadResult.url
      compraData.padronFilename = uploadResult.filename
      compraData.padronFileType = uploadResult.fileType
      compraData.padronOriginalName = uploadResult.originalName
      compraData.padronFileSize = uploadResult.size
    }

    // Crear registro de compra
    const nuevaCompra = this.compraMaquinariaRepository.create(compraData)
    const compraGuardada = await this.compraMaquinariaRepository.save(nuevaCompra)

    return { maquinaria: maquinariaGuardada, compra: compraGuardada }
  }

  async obtenerTodasLasCompras(): Promise<CompraMaquinaria[]> {
    return this.compraMaquinariaRepository.find({
      relations: ["maquinaria"],
      order: { fechaCreacion: "DESC" },
    })
  }

  async obtenerCompraPorId(id: number): Promise<CompraMaquinaria | null> {
    return this.compraMaquinariaRepository.findOne({
      where: { id },
      relations: ["maquinaria"],
    })
  }

  async obtenerComprasPorMaquinaria(maquinaria_id: number): Promise<CompraMaquinaria[]> {
    return this.compraMaquinariaRepository.find({
      where: { maquinaria_id },
      relations: ["maquinaria"],
      order: { fechaCreacion: "DESC" },
    })
  }

  async obtenerComprasPorFecha(fechaInicio: string, fechaFin: string): Promise<CompraMaquinaria[]> {
    return this.compraMaquinariaRepository.find({
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

  async actualizarCompra(
    id: number,
    data: UpdateCompraMaquinaria,
    file?: Express.Multer.File,
  ): Promise<CompraMaquinaria | null> {
    const compra = await this.compraMaquinariaRepository.findOne({
      where: { id },
      relations: ["maquinaria"],
    })

    if (!compra) {
      throw new Error("Compra no encontrada")
    }

    // Procesar nuevo archivo si existe
    if (file) {
      // Eliminar archivo anterior
      if (compra.padronFilename) {
        await MaquinariaFileUploadService.deleteFile(compra.padronFilename)
      }

      // Subir nuevo archivo
      const uploadResult = await MaquinariaFileUploadService.uploadFile(file)
      data.padronUrl = uploadResult.url
      data.padronFilename = uploadResult.filename
      data.padronFileType = uploadResult.fileType
      data.padronOriginalName = uploadResult.originalName
      data.padronFileSize = uploadResult.size
    }

    // Actualizar maquinaria
    if (compra.maquinaria_id) {
      const maquinariaUpdate: any = {}
      if (data.patente) maquinariaUpdate.patente = data.patente
      if (data.marca) maquinariaUpdate.marca = data.marca
      if (data.modelo) maquinariaUpdate.modelo = data.modelo
      if (data.anio) maquinariaUpdate.año = data.anio
      if (data.valorCompra) maquinariaUpdate.valorCompra = data.valorCompra

      if (Object.keys(maquinariaUpdate).length > 0) {
        await this.maquinariaRepository.update({ id: compra.maquinaria_id }, maquinariaUpdate)
      }
    }

    // Actualizar compra
    Object.assign(compra, data)
    return this.compraMaquinariaRepository.save(compra)
  }

  // MÉTODO eliminarCompra() ELIMINADO

  async obtenerMaquinariasConCompras(): Promise<Maquinaria[]> {
    return this.maquinariaRepository.find({
      relations: ["compras"],
      order: { fechaCompra: "DESC" },
    })
  }
}

export const compraMaquinariaService = new CompraMaquinariaService()
