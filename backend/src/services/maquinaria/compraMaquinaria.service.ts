import type { Repository } from "typeorm"
import { AppDataSource } from "../../config/configDB.js"
import { CompraMaquinaria } from "../../entity/maquinaria/compraMaquinaria.entity.js"
import { Maquinaria } from "../../entity/maquinaria/maquinaria.entity.js"
import type {
  CreateCompraMaquinaria,
  UpdateCompraMaquinaria,
  CreateCompraMaquinariaData,
  UpdateCompraMaquinariaData,
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
    try {
      // Verificar si ya existe una maquinaria con la misma patente
      const maquinariaExistente = await this.maquinariaRepository.findOne({
        where: { patente: data.patente },
      })

      if (maquinariaExistente) {
        throw new Error(`Ya existe una maquinaria con la patente ${data.patente}`)
      }

      // Verificar si ya existe una maquinaria con el mismo número de chasis
      const maquinariaChasisExistente = await this.maquinariaRepository.findOne({
        where: { numeroChasis: data.numeroChasis },
      })

      if (maquinariaChasisExistente) {
        throw new Error(`Ya existe una maquinaria con el número de chasis ${data.numeroChasis}`)
      }

      // Crear la maquinaria primero con todos los campos requeridos según la entidad existente
      const nuevaMaquinaria = this.maquinariaRepository.create({
        patente: data.patente,
        grupo: data.grupo,
        marca: data.marca,
        modelo: data.modelo,
        año: data.anio, // La entidad existente usa 'año'
        fechaCompra: new Date(data.fechaCompra),
        valorCompra: data.valorCompra,
        avaluoFiscal: data.avaluoFiscal,
        numeroChasis: data.numeroChasis,
        kilometrajeInicial: data.kilometrajeInicial || 0,
        kilometrajeActual: data.kilometrajeInicial || 0, // Inicialmente igual al inicial
        estado: "disponible" as any,
      })

      const maquinariaGuardada = await this.maquinariaRepository.save(nuevaMaquinaria)

      // Preparar datos de la compra (registro histórico)
      const compraData: CreateCompraMaquinariaData = {
        ...data,
        maquinaria_id: maquinariaGuardada.id,
      }

      // Si hay archivo, procesarlo
      if (file) {
        try {
          const uploadResult = await MaquinariaFileUploadService.uploadFile(file)
          compraData.padronUrl = uploadResult.url
          compraData.padronFilename = uploadResult.filename
          compraData.padronFileType = uploadResult.fileType
          compraData.padronOriginalName = uploadResult.originalName
          compraData.padronFileSize = uploadResult.size
        } catch (uploadError) {
          console.error("Error al subir archivo:", uploadError)
          // Si falla la subida del archivo, eliminar la maquinaria creada
          await this.maquinariaRepository.delete(maquinariaGuardada.id)
          throw new Error("Error al procesar el archivo del padrón")
        }
      }

      // Crear el registro de compra (historial)
      const nuevaCompra = this.compraMaquinariaRepository.create(compraData)
      const compraGuardada = await this.compraMaquinariaRepository.save(nuevaCompra)

      return { maquinaria: maquinariaGuardada, compra: compraGuardada }
    } catch (error) {
      console.error("Error al registrar compra:", error)
      throw error
    }
  }

  async obtenerTodasLasCompras(): Promise<CompraMaquinaria[]> {
    try {
      return await this.compraMaquinariaRepository.find({
        relations: ["maquinaria"],
        order: { fechaCreacion: "DESC" },
      })
    } catch (error) {
      console.error("Error al obtener compras:", error)
      throw new Error("Error al obtener las compras")
    }
  }

  async obtenerCompraPorId(id: number): Promise<CompraMaquinaria | null> {
    try {
      return await this.compraMaquinariaRepository.findOne({
        where: { id },
        relations: ["maquinaria"],
      })
    } catch (error) {
      console.error("Error al obtener compra por ID:", error)
      throw new Error("Error al obtener la compra")
    }
  }

  async obtenerComprasPorMaquinaria(maquinaria_id: number): Promise<CompraMaquinaria[]> {
    try {
      return await this.compraMaquinariaRepository.find({
        where: { maquinaria_id },
        relations: ["maquinaria"],
        order: { fechaCreacion: "DESC" },
      })
    } catch (error) {
      console.error("Error al obtener compras por maquinaria:", error)
      throw new Error("Error al obtener compras por maquinaria")
    }
  }

  async obtenerComprasPorFecha(fechaInicio: string, fechaFin: string): Promise<CompraMaquinaria[]> {
    try {
      return await this.compraMaquinariaRepository
        .createQueryBuilder("compra")
        .leftJoinAndSelect("compra.maquinaria", "maquinaria")
        .where("compra.fechaCompra >= :fechaInicio", { fechaInicio })
        .andWhere("compra.fechaCompra <= :fechaFin", { fechaFin })
        .orderBy("compra.fechaCompra", "DESC")
        .getMany()
    } catch (error) {
      console.error("Error al obtener compras por fecha:", error)
      throw new Error("Error al obtener compras por fecha")
    }
  }

  async obtenerTotalCompras(fechaInicio: string, fechaFin: string): Promise<{ total: number }> {
    try {
      const result = await this.compraMaquinariaRepository
        .createQueryBuilder("compra")
        .select("SUM(compra.valorCompra)", "total")
        .where("compra.fechaCompra >= :fechaInicio", { fechaInicio })
        .andWhere("compra.fechaCompra <= :fechaFin", { fechaFin })
        .getRawOne()

      return { total: Number.parseFloat(result.total) || 0 }
    } catch (error) {
      console.error("Error al obtener total de compras:", error)
      throw new Error("Error al obtener total de compras")
    }
  }

  async actualizarCompra(
    id: number,
    data: UpdateCompraMaquinaria,
    file?: Express.Multer.File,
  ): Promise<CompraMaquinaria | null> {
    try {
      const compra = await this.compraMaquinariaRepository.findOne({
        where: { id },
        relations: ["maquinaria"],
      })

      if (!compra) {
        throw new Error("Compra no encontrada")
      }

      // Verificar patente duplicada si se está actualizando
      if (data.patente && data.patente !== compra.patente) {
        const maquinariaExistente = await this.maquinariaRepository.findOne({
          where: { patente: data.patente },
        })

        if (maquinariaExistente && maquinariaExistente.id !== compra.maquinaria_id) {
          throw new Error(`Ya existe una maquinaria con la patente ${data.patente}`)
        }
      }

      // Verificar número de chasis duplicado si se está actualizando
      if (data.numeroChasis && data.numeroChasis !== compra.numeroChasis) {
        const maquinariaChasisExistente = await this.maquinariaRepository.findOne({
          where: { numeroChasis: data.numeroChasis },
        })

        if (maquinariaChasisExistente && maquinariaChasisExistente.id !== compra.maquinaria_id) {
          throw new Error(`Ya existe una maquinaria con el número de chasis ${data.numeroChasis}`)
        }
      }

      // Preparar datos de actualización para la compra
      const updateData: UpdateCompraMaquinariaData = { ...data }

      // Si hay archivo nuevo, procesarlo
      if (file) {
        try {
          // Eliminar archivo anterior si existe
          if (compra.padronFilename) {
            await MaquinariaFileUploadService.deleteFile(compra.padronFilename)
          }

          // Subir nuevo archivo
          const uploadResult = await MaquinariaFileUploadService.uploadFile(file)
          updateData.padronUrl = uploadResult.url
          updateData.padronFilename = uploadResult.filename
          updateData.padronFileType = uploadResult.fileType
          updateData.padronOriginalName = uploadResult.originalName
          updateData.padronFileSize = uploadResult.size
        } catch (uploadError) {
          console.error("Error al actualizar archivo:", uploadError)
          throw new Error("Error al procesar el nuevo archivo del padrón")
        }
      }

      // Actualizar maquinaria si es necesario
      if (compra.maquinaria_id) {
        const maquinariaUpdateData: any = {}

        // Campos que se actualizan en ambas tablas (usando los nombres correctos de la entidad existente)
        if (data.patente) maquinariaUpdateData.patente = data.patente
        if (data.grupo) maquinariaUpdateData.grupo = data.grupo
        if (data.marca) maquinariaUpdateData.marca = data.marca
        if (data.modelo) maquinariaUpdateData.modelo = data.modelo
        if (data.anio) maquinariaUpdateData.año = data.anio // La entidad existente usa 'año'
        if (data.fechaCompra) maquinariaUpdateData.fechaCompra = new Date(data.fechaCompra)
        if (data.valorCompra) maquinariaUpdateData.valorCompra = data.valorCompra
        if (data.avaluoFiscal) maquinariaUpdateData.avaluoFiscal = data.avaluoFiscal
        if (data.numeroChasis) maquinariaUpdateData.numeroChasis = data.numeroChasis
        if (data.kilometrajeInicial !== undefined) maquinariaUpdateData.kilometrajeInicial = data.kilometrajeInicial

        if (Object.keys(maquinariaUpdateData).length > 0) {
          await this.maquinariaRepository.update({ id: compra.maquinaria_id }, maquinariaUpdateData)
        }
      }

      // Actualizar compra (registro histórico)
      await this.compraMaquinariaRepository.update(id, updateData as any)

      // Retornar compra actualizada
      return await this.compraMaquinariaRepository.findOne({
        where: { id },
        relations: ["maquinaria"],
      })
    } catch (error) {
      console.error("Error al actualizar compra:", error)
      throw error
    }
  }

  // MÉTODO eliminarCompra ELIMINADO - Ya no se puede eliminar compras completas

  async eliminarPadron(id: number): Promise<CompraMaquinaria | null> {
    try {
      const compra = await this.compraMaquinariaRepository.findOne({
        where: { id },
      })

      if (!compra) {
        throw new Error("Compra no encontrada")
      }

      if (!compra.padronFilename) {
        throw new Error("La compra no tiene un padrón asociado")
      }

      // Eliminar archivo del servidor
      try {
        await MaquinariaFileUploadService.deleteFile(compra.padronFilename)
      } catch (error) {
        console.error("Error al eliminar archivo del servidor:", error)
      }

      // Limpiar campos del padrón en la base de datos
      await this.compraMaquinariaRepository.update(id, {
        padronUrl: undefined as any,
        padronFilename: undefined as any,
        padronFileType: undefined as any,
        padronOriginalName: undefined as any,
        padronFileSize: undefined as any,
      })

      // Retornar compra actualizada
      return await this.compraMaquinariaRepository.findOne({
        where: { id },
        relations: ["maquinaria"],
      })
    } catch (error) {
      console.error("Error al eliminar padrón:", error)
      throw error
    }
  }

  /**
   * Obtener todas las maquinarias con sus compras asociadas
   */
  async obtenerMaquinariasConCompras(): Promise<Maquinaria[]> {
    try {
      return await this.maquinariaRepository.find({
        relations: ["compras"],
        order: { fechaCompra: "DESC" },
      })
    } catch (error) {
      console.error("Error al obtener maquinarias con compras:", error)
      throw new Error("Error al obtener maquinarias con compras")
    }
  }

  /**
   * Obtener una maquinaria específica con su historial de compras
   */
  async obtenerMaquinariaConHistorial(id: number): Promise<Maquinaria | null> {
    try {
      return await this.maquinariaRepository.findOne({
        where: { id },
        relations: ["compras"],
      })
    } catch (error) {
      console.error("Error al obtener maquinaria con historial:", error)
      throw new Error("Error al obtener maquinaria con historial")
    }
  }
}

export const compraMaquinariaService = new CompraMaquinariaService()
