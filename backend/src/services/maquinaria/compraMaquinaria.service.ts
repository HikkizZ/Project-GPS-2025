import type { Repository } from "typeorm"
import { AppDataSource } from "../../config/configDB.js"
import { CompraMaquinaria } from "../../entity/maquinaria/compraMaquinaria.entity.js"
import { Maquinaria } from "../../entity/maquinaria/maquinaria.entity.js"
import { Supplier } from "../../entity/stakeholders/supplier.entity.js"
import { FileUploadService } from "../../services/fileUpload.service.js"
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

    let padronUrl: string | undefined

    try {
      // Validar que el supplier existe y está activo si se proporciona
      if (data.supplierRut) {
        const supplier = await queryRunner.manager.findOne(Supplier, {
          where: { rut: data.supplierRut, isActive: true },
        })

        if (!supplier) {
          throw new Error(`Proveedor con RUT ${data.supplierRut} no encontrado o inactivo`)
        }

        // Actualizar datos con información del supplier
        data.proveedor = supplier.name
        data.supplierId = supplier.id
      }

      // Verificar si existe una maquinaria con la misma patente (activa o inactiva)
      const maquinariaExistente = await queryRunner.manager.findOne(Maquinaria, {
        where: { patente: data.patente },
      })

      // Verificar si existe una compra con la misma patente (activa o inactiva)
      const compraExistente = await queryRunner.manager.findOne(CompraMaquinaria, {
        where: { patente: data.patente },
      })

      let maquinariaGuardada: Maquinaria
      let compraGuardada: CompraMaquinaria

      // Procesar archivo PDF si existe
      if (file) {
        // El archivo ya fue procesado por Multer y está en la carpeta correcta
        padronUrl = file.filename
      }

      if (maquinariaExistente && compraExistente) {
        // Si existe una maquinaria y compra con la misma patente, reactivar y actualizar
        if (!maquinariaExistente.isActive || !compraExistente.isActive) {
          // Reactivar y actualizar maquinaria
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
              padronUrl,
              isActive: true,
            },
          )

          // Reactivar y actualizar compra
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
              padronUrl,
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
        // Verificar que no exista una maquinaria activa con la misma patente
        const maquinariaActiva = await queryRunner.manager.findOne(Maquinaria, {
          where: { patente: data.patente, isActive: true },
        })

        if (maquinariaActiva) {
          throw new Error(`Ya existe una maquinaria activa con la patente ${data.patente}`)
        }

        // Verificar número de chasis único entre registros activos
        const chasisExistente = await queryRunner.manager.findOne(Maquinaria, {
          where: { numeroChasis: data.numeroChasis, isActive: true },
        })

        if (chasisExistente) {
          throw new Error(`Ya existe una maquinaria activa con el número de chasis ${data.numeroChasis}`)
        }

        // Crear nueva maquinaria
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
          padronUrl,
          isActive: true,
        })

        maquinariaGuardada = await queryRunner.manager.save(nuevaMaquinaria)

        // Crear registro de compra
        const compraData: CreateCompraMaquinariaData = {
          ...data,
          maquinaria_id: maquinariaGuardada.id,
          padronUrl,
          isActive: true,
        }

        const nuevaCompra = queryRunner.manager.create(CompraMaquinaria, compraData)
        compraGuardada = await queryRunner.manager.save(nuevaCompra)
      }

      await queryRunner.commitTransaction()
      return { maquinaria: maquinariaGuardada, compra: compraGuardada }
    } catch (error) {
      await queryRunner.rollbackTransaction()

      // Eliminar archivo subido si existe y hay error
      if (file && padronUrl) {
        try {
          FileUploadService.deletePadronFile(padronUrl)
        } catch (deleteError) {
          console.error("Error al eliminar archivo tras fallo de transacción:", deleteError)
        }
      }

      throw error
    } finally {
      await queryRunner.release()
    }
  }

  // ... resto de métodos sin cambios significativos ...

  async actualizarCompra(
    id: number,
    data: UpdateCompraMaquinaria,
    file?: Express.Multer.File,
  ): Promise<CompraMaquinaria | null> {
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    let padronUrl: string | undefined

    try {
      const compra = await queryRunner.manager.findOne(CompraMaquinaria, {
        where: { id, isActive: true },
        relations: ["maquinaria"],
      })

      if (!compra) {
        throw new Error("Compra no encontrada o inactiva")
      }

      // Procesar nuevo archivo PDF si existe
      if (file) {
        // NO eliminar archivo anterior para mantener trazabilidad histórica
        // if (compra.padronUrl) {
        //   FileUploadService.deletePadronFile(compra.padronUrl)
        // }

        // El archivo ya fue procesado por Multer
        padronUrl = file.filename
        data.padronUrl = padronUrl
      }

      // Validar supplier si se proporciona
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

      // Actualizar maquinaria si existe relación
      if (compra.maquinaria_id) {
        const maquinariaUpdate: any = {}
        if (data.patente) maquinariaUpdate.patente = data.patente
        if (data.grupo) maquinariaUpdate.grupo = data.grupo
        if (data.marca) maquinariaUpdate.marca = data.marca
        if (data.modelo) maquinariaUpdate.modelo = data.modelo
        if (data.anio) maquinariaUpdate.año = data.anio
        if (data.valorCompra) maquinariaUpdate.valorCompra = data.valorCompra
        if (data.avaluoFiscal) maquinariaUpdate.avaluoFiscal = data.avaluoFiscal
        if (padronUrl !== undefined) maquinariaUpdate.padronUrl = padronUrl

        if (Object.keys(maquinariaUpdate).length > 0) {
          await queryRunner.manager.update(Maquinaria, { id: compra.maquinaria_id }, maquinariaUpdate)
        }
      }

      // Actualizar compra
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

  // Nueva función para descargar padrón de compra
  async descargarPadron(id: number): Promise<{ filePath: string; customFilename: string }> {
    const compra = await this.compraMaquinariaRepository.findOne({
      where: { id, isActive: true },
      relations: ["maquinaria"],
    })

    if (!compra) {
      throw new Error("Compra no encontrada")
    }

    if (!compra.padronUrl) {
      throw new Error("No hay padrón disponible para descargar")
    }

    // Obtener la ruta del archivo
    const filePath = FileUploadService.getPadronPath(compra.padronUrl)

    // Verificar que el archivo existe
    if (!FileUploadService.fileExists(filePath)) {
      throw new Error("El archivo del padrón no se encuentra en el servidor")
    }

    // Generar nombre personalizado
    const customFilename = `Padron_Compra_${compra.patente}_${compra.marca}_${compra.modelo}.pdf`.replace(
      /[^a-zA-Z0-9.-]/g,
      "_",
    )

    return { filePath, customFilename }
  }

  // ... resto de métodos sin cambios ...
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

      // Soft delete de la compra
      await queryRunner.manager.update(CompraMaquinaria, { id }, { isActive: false })

      // Soft delete de la maquinaria relacionada
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

      // Verificar que no exista otra maquinaria activa con la misma patente
      const maquinariaActiva = await queryRunner.manager.findOne(Maquinaria, {
        where: { patente: compra.patente, isActive: true },
      })

      if (maquinariaActiva) {
        throw new Error(`Ya existe una maquinaria activa con la patente ${compra.patente}`)
      }

      // Restaurar compra
      await queryRunner.manager.update(CompraMaquinaria, { id }, { isActive: true })
      // Restaurar maquinaria relacionada
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
}
