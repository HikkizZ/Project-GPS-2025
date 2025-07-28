import type { Repository } from "typeorm"
import { AppDataSource } from "../../config/configDB.js"
import { CompraMaquinaria } from "../../entity/maquinaria/compraMaquinaria.entity.js"
import { Maquinaria } from "../../entity/maquinaria/maquinaria.entity.js"
import { Supplier } from "../../entity/stakeholders/supplier.entity.js"
import { MaquinariaFileUploadService } from "../fileUpload.service.js"
import type {
  CreateCompraMaquinaria,
  UpdateCompraMaquinaria,
  CreateCompraMaquinariaData,
} from "../../types/maquinaria/maquinaria.types.js"
import type { Express } from "express"

export class CompraMaquinariaService {
  private compraMaquinariaRepository: Repository<CompraMaquinaria>
  private maquinariaRepository: Repository<Maquinaria>
  private supplierRepository: Repository<Supplier>

  constructor() {
    this.compraMaquinariaRepository = AppDataSource.getRepository(CompraMaquinaria)
    this.maquinariaRepository = AppDataSource.getRepository(Maquinaria)
    this.supplierRepository = AppDataSource.getRepository(Supplier)
  }

  async registrarCompra(
    data: CreateCompraMaquinaria,
    file?: Express.Multer.File,
  ): Promise<{ maquinaria: Maquinaria; compra: CompraMaquinaria }> {
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    let padronFilename: string | undefined

    try {
      if (data.supplierRut) {
        const supplier = await queryRunner.manager.findOne(Supplier, {
          where: { rut: data.supplierRut, isActive: true },
        })

        if (!supplier) {
          throw new Error(`Proveedor con RUT ${data.supplierRut} no encontrado o inactivo`)
        }

        data.proveedor = supplier.name
        data.supplierId = supplier.id
      }

      const maquinariaExistente = await queryRunner.manager.findOne(Maquinaria, {
        where: { patente: data.patente },
      })

      const compraExistente = await queryRunner.manager.findOne(CompraMaquinaria, {
        where: { patente: data.patente },
      })

      let maquinariaGuardada: Maquinaria
      let compraGuardada: CompraMaquinaria

      if (file) {
        const uploadResult = await MaquinariaFileUploadService.uploadFile(file)
        padronFilename = uploadResult.filename
      }

      if (maquinariaExistente && compraExistente) {
        if (!maquinariaExistente.isActive || !compraExistente.isActive) {
          await queryRunner.manager.update(
            Maquinaria,
            { id: maquinariaExistente.id },
            {
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
              padronUrl: padronFilename,
              isActive: true,
            },
          )

          await queryRunner.manager.update(
            CompraMaquinaria,
            { id: compraExistente.id },
            {
              grupo: data.grupo,
              marca: data.marca,
              modelo: data.modelo,
              anio: data.anio,
              fechaCompra: data.fechaCompra,
              valorCompra: data.valorCompra,
              avaluoFiscal: data.avaluoFiscal,
              numeroChasis: data.numeroChasis,
              kilometrajeInicial: data.kilometrajeInicial || 0,
              supplierId: data.supplierId,
              supplierRut: data.supplierRut,
              proveedor: data.proveedor,
              observaciones: data.observaciones,
              padronUrl: padronFilename,
              isActive: true,
            },
          )

          maquinariaGuardada = (await queryRunner.manager.findOne(Maquinaria, {
            where: { id: maquinariaExistente.id },
          })) as Maquinaria

          compraGuardada = (await queryRunner.manager.findOne(CompraMaquinaria, {
            where: { id: compraExistente.id },
          })) as CompraMaquinaria
        } else {
          throw new Error(`Ya existe una maquinaria activa con la patente ${data.patente}`)
        }
      } else {
        const maquinariaActiva = await queryRunner.manager.findOne(Maquinaria, {
          where: { patente: data.patente, isActive: true },
        })

        if (maquinariaActiva) {
          throw new Error(`Ya existe una maquinaria activa con la patente ${data.patente}`)
        }

        const chasisExistente = await queryRunner.manager.findOne(Maquinaria, {
          where: { numeroChasis: data.numeroChasis, isActive: true },
        })

        if (chasisExistente) {
          throw new Error(`Ya existe una maquinaria activa con el número de chasis ${data.numeroChasis}`)
        }

        const nuevaMaquinaria = queryRunner.manager.create(Maquinaria, {
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
          padronUrl: padronFilename,
          isActive: true,
        })

        maquinariaGuardada = await queryRunner.manager.save(nuevaMaquinaria)

        const compraData: CreateCompraMaquinariaData = {
          ...data,
          maquinaria_id: maquinariaGuardada.id,
          padronUrl: padronFilename,
          isActive: true,
        }

        const nuevaCompra = queryRunner.manager.create(CompraMaquinaria, compraData)
        compraGuardada = await queryRunner.manager.save(nuevaCompra)
      }

      await queryRunner.commitTransaction()
      return { maquinaria: maquinariaGuardada, compra: compraGuardada }
    } catch (error) {
      await queryRunner.rollbackTransaction()

      if (file && padronFilename) {
        try {
          await MaquinariaFileUploadService.deleteFile(padronFilename)
        } catch (deleteError) {
          console.error("Error al eliminar archivo tras fallo de transacción:", deleteError)
        }
      }

      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async obtenerTodasLasCompras(incluirInactivas = false): Promise<CompraMaquinaria[]> {
    const whereCondition = incluirInactivas ? {} : { isActive: true }

    return this.compraMaquinariaRepository.find({
      where: whereCondition,
      relations: ["maquinaria", "supplier"],
      order: { fechaCreacion: "DESC" },
    })
  }

  async obtenerCompraPorId(id: number, incluirInactivas = false): Promise<CompraMaquinaria | null> {
    const whereCondition = incluirInactivas ? { id } : { id, isActive: true }

    return this.compraMaquinariaRepository.findOne({
      where: whereCondition,
      relations: ["maquinaria", "supplier"],
    })
  }

  async obtenerComprasPorMaquinaria(maquinaria_id: number, incluirInactivas = false): Promise<CompraMaquinaria[]> {
    const whereCondition = incluirInactivas ? { maquinaria_id } : { maquinaria_id, isActive: true }

    return this.compraMaquinariaRepository.find({
      where: whereCondition,
      relations: ["maquinaria", "supplier"],
      order: { fechaCreacion: "DESC" },
    })
  }

  async obtenerComprasPorFecha(
    fechaInicio: string,
    fechaFin: string,
    incluirInactivas = false,
  ): Promise<CompraMaquinaria[]> {
    const query = this.compraMaquinariaRepository
      .createQueryBuilder("compra")
      .leftJoinAndSelect("compra.maquinaria", "maquinaria")
      .leftJoinAndSelect("compra.supplier", "supplier")
      .where("compra.fechaCompra >= :fechaInicio", { fechaInicio })
      .andWhere("compra.fechaCompra <= :fechaFin", { fechaFin })

    if (!incluirInactivas) {
      query.andWhere("compra.isActive = :isActive", { isActive: true })
    }

    return query.orderBy("compra.fechaCompra", "DESC").getMany()
  }

  async actualizarCompra(
    id: number,
    data: UpdateCompraMaquinaria,
    file?: Express.Multer.File,
  ): Promise<CompraMaquinaria | null> {
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    let padronFilename: string | undefined

    try {
      const compra = await queryRunner.manager.findOne(CompraMaquinaria, {
        where: { id, isActive: true },
        relations: ["maquinaria"],
      })

      if (!compra) {
        throw new Error("Compra no encontrada o inactiva")
      }

      if (file) {
        if (compra.padronUrl) {
          await MaquinariaFileUploadService.deleteFile(compra.padronUrl)
        }

        const uploadResult = await MaquinariaFileUploadService.uploadFile(file)
        padronFilename = uploadResult.filename
        data.padronUrl = padronFilename
      }

      if (data.supplierRut) {
        const supplier = await queryRunner.manager.findOne(Supplier, {
          where: { rut: data.supplierRut, isActive: true },
        })

        if (!supplier) {
          throw new Error(`Proveedor con RUT ${data.supplierRut} no encontrado o inactivo`)
        }

        data.proveedor = supplier.name
        data.supplierId = supplier.id
      }

      if (compra.maquinaria_id) {
        const maquinariaUpdate: any = {}
        if (data.patente) maquinariaUpdate.patente = data.patente
        if (data.grupo) maquinariaUpdate.grupo = data.grupo
        if (data.marca) maquinariaUpdate.marca = data.marca
        if (data.modelo) maquinariaUpdate.modelo = data.modelo
        if (data.anio) maquinariaUpdate.año = data.anio
        if (data.valorCompra) maquinariaUpdate.valorCompra = data.valorCompra
        if (data.avaluoFiscal) maquinariaUpdate.avaluoFiscal = data.avaluoFiscal
        if (padronFilename !== undefined) maquinariaUpdate.padronUrl = padronFilename

        if (Object.keys(maquinariaUpdate).length > 0) {
          await queryRunner.manager.update(Maquinaria, { id: compra.maquinaria_id }, maquinariaUpdate)
        }
      }

      Object.assign(compra, data)
      const compraActualizada = await queryRunner.manager.save(compra)

      await queryRunner.commitTransaction()
      return compraActualizada
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async eliminarCompra(id: number): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const compra = await queryRunner.manager.findOne(CompraMaquinaria, {
        where: { id, isActive: true },
        relations: ["maquinaria"],
      })

      if (!compra) {
        throw new Error("Compra no encontrada o ya eliminada")
      }

      await queryRunner.manager.update(CompraMaquinaria, { id }, { isActive: false })

      if (compra.maquinaria_id) {
        await queryRunner.manager.update(Maquinaria, { id: compra.maquinaria_id }, { isActive: false })
      }

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async restaurarCompra(id: number): Promise<CompraMaquinaria> {
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const compra = await queryRunner.manager.findOne(CompraMaquinaria, {
        where: { id, isActive: false },
        relations: ["maquinaria"],
      })

      if (!compra) {
        throw new Error("Compra no encontrada o ya activa")
      }

      const maquinariaActiva = await queryRunner.manager.findOne(Maquinaria, {
        where: { patente: compra.patente, isActive: true },
      })

      if (maquinariaActiva) {
        throw new Error(`Ya existe una maquinaria activa con la patente ${compra.patente}`)
      }

      await queryRunner.manager.update(CompraMaquinaria, { id }, { isActive: true })
      if (compra.maquinaria_id) {
        await queryRunner.manager.update(Maquinaria, { id: compra.maquinaria_id }, { isActive: true })
      }
      const compraRestaurada = await queryRunner.manager.findOne(CompraMaquinaria, {
        where: { id },
        relations: ["maquinaria", "supplier"],
      })
      await queryRunner.commitTransaction()
      return compraRestaurada as CompraMaquinaria
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async eliminarPadronCompra(id: number): Promise<CompraMaquinaria> {
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const compra = await queryRunner.manager.findOne(CompraMaquinaria, {
        where: { id, isActive: true },
        relations: ["maquinaria"],
      })

      if (!compra) {
        throw new Error("Compra no encontrada o inactiva")
      }

      if (!compra.padronUrl) {
        throw new Error("Esta compra no tiene padrón para eliminar")
      }

      await MaquinariaFileUploadService.deleteFile(compra.padronUrl)

      await queryRunner.manager.update(CompraMaquinaria, { id }, { padronUrl: undefined })

      if (compra.maquinaria_id) {
        await queryRunner.manager.update(Maquinaria, { id: compra.maquinaria_id }, { padronUrl: undefined })
      }

      const compraActualizada = await queryRunner.manager.findOne(CompraMaquinaria, {
        where: { id },
        relations: ["maquinaria", "supplier"],
      })

      await queryRunner.commitTransaction()
      return compraActualizada as CompraMaquinaria
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }
}
