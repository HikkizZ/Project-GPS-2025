import type { Repository } from "typeorm"
import { VentaMaquinaria } from "../../entity/maquinaria/ventaMaquinaria.entity.js"
import { Maquinaria, EstadoMaquinaria } from "../../entity/maquinaria/maquinaria.entity.js"
import { Customer } from "../../entity/stakeholders/customer.entity.js"
import { AppDataSource } from "../../config/configDB.js"

export class VentaMaquinariaService {
  private ventaRepository: Repository<VentaMaquinaria>
  private maquinariaRepository: Repository<Maquinaria>
  private customerRepository: Repository<Customer>

  constructor() {
    this.ventaRepository = AppDataSource.getRepository(VentaMaquinaria)
    this.maquinariaRepository = AppDataSource.getRepository(Maquinaria)
    this.customerRepository = AppDataSource.getRepository(Customer)
  }

  async registrarVenta(ventaData: {
    patente: string
    fechaVenta: Date
    valorCompra: number
    valorVenta: number
    customerId: number
    observaciones?: string
  }): Promise<{
    maquinaria: Maquinaria
    venta: VentaMaquinaria
    customer: Customer
    advertencia?: {
      mensaje: string
      ventasEliminadas: Array<{
        id: number
        fechaVenta: Date
        valorVenta: number
        comprador: string
        fechaEliminacion: Date
      }>
    }
  }> {
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Validar que el customer existe y está activo
      const customer = await queryRunner.manager.findOne(Customer, {
        where: { id: ventaData.customerId, isActive: true },
      })

      if (!customer) {
        throw new Error(`Cliente con ID ${ventaData.customerId} no encontrado o inactivo`)
      }

      // Buscar maquinaria disponible y activa
      const maquinaria = await queryRunner.manager.findOne(Maquinaria, {
        where: {
          patente: ventaData.patente,
          isActive: true,
        },
      })

      if (!maquinaria) {
        throw new Error(`No se encontró maquinaria con patente: ${ventaData.patente}`)
      }

      // NUEVA LÓGICA: Verificar ventas existentes para esta maquinaria
      const ventasExistentes = await queryRunner.manager.find(VentaMaquinaria, {
        where: { maquinariaId: maquinaria.id },
        relations: ["customer"],
        order: { fechaVenta: "DESC" },
      })

      const ventaActiva = ventasExistentes.find((v) => v.isActive === true)
      const ventasSoftDeleted = ventasExistentes.filter((v) => v.isActive === false)

      // Si hay venta activa → RECHAZAR
      if (ventaActiva) {
        throw new Error(
          `No se puede registrar la venta. La maquinaria ${ventaData.patente} ya tiene una venta activa registrada el ${ventaActiva.fechaVenta.toLocaleDateString("es-CL")} por ${ventaActiva.customer?.name || ventaActiva.comprador || "cliente no especificado"}.`,
        )
      }

      // Si hay ventas soft-deleted, eliminarlas permanentemente
      if (ventasSoftDeleted.length > 0) {
        console.log(
          `Eliminando permanentemente ${ventasSoftDeleted.length} venta(s) soft-deleted para la maquinaria ${ventaData.patente}`,
        )

        // Eliminar permanentemente las ventas soft-deleted
        await queryRunner.manager.delete(VentaMaquinaria, {
          maquinariaId: maquinaria.id,
          isActive: false,
        })
      }

      // Verificar que la maquinaria esté disponible para venta
      if (maquinaria.estado !== EstadoMaquinaria.DISPONIBLE) {
        throw new Error(
          `La maquinaria ${ventaData.patente} no está disponible para venta. Estado actual: ${maquinaria.estado}`,
        )
      }

      // Cambiar estado a vendida
      await queryRunner.manager.update(Maquinaria, { id: maquinaria.id }, { estado: EstadoMaquinaria.VENDIDA })

      // Crear registro de venta
      const venta = queryRunner.manager.create(VentaMaquinaria, {
        maquinariaId: maquinaria.id,
        patente: ventaData.patente,
        fechaVenta: ventaData.fechaVenta,
        valorCompra: ventaData.valorCompra,
        valorVenta: ventaData.valorVenta,
        comprador: customer.name,
        customerRut: customer.rut,
        customerId: customer.id,
        observaciones: ventaData.observaciones,
      })

      const ventaGuardada = await queryRunner.manager.save(venta)

      // Actualizar maquinaria con los nuevos datos
      const maquinariaActualizada = await queryRunner.manager.findOne(Maquinaria, {
        where: { id: maquinaria.id },
      })

      await queryRunner.commitTransaction()

      // Preparar respuesta (sin advertencia)
      const resultado = {
        maquinaria: maquinariaActualizada as Maquinaria,
        venta: ventaGuardada,
        customer,
      }

      return resultado
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async obtenerTodasLasVentas(incluirInactivas = false): Promise<VentaMaquinaria[]> {
    const query = this.ventaRepository
      .createQueryBuilder("venta")
      .leftJoinAndSelect("venta.maquinaria", "maquinaria")
      .leftJoinAndSelect("venta.customer", "customer")

    if (!incluirInactivas) {
      query.where("venta.isActive = :isActive", { isActive: true })
    }

    return query.orderBy("venta.fechaVenta", "DESC").getMany()
  }

  async obtenerVentaPorId(id: number, incluirInactivas = false): Promise<VentaMaquinaria> {
    const whereCondition = incluirInactivas ? { id } : { id, isActive: true }

    const venta = await this.ventaRepository.findOne({
      where: whereCondition,
      relations: ["maquinaria", "customer"],
    })

    if (!venta) {
      throw new Error(`Venta con ID ${id} no encontrada`)
    }

    return venta
  }

  async obtenerVentasPorPatente(patente: string, incluirInactivas = false): Promise<VentaMaquinaria[]> {
    const query = this.ventaRepository
      .createQueryBuilder("venta")
      .leftJoinAndSelect("venta.maquinaria", "maquinaria")
      .leftJoinAndSelect("venta.customer", "customer")
      .where("venta.patente = :patente", { patente })

    if (!incluirInactivas) {
      query.andWhere("venta.isActive = :isActive", { isActive: true })
    }

    return query.orderBy("venta.fechaVenta", "DESC").getMany()
  }

  async obtenerVentasPorFecha(fechaInicio: Date, fechaFin: Date, incluirInactivas = false): Promise<VentaMaquinaria[]> {
    const query = this.ventaRepository
      .createQueryBuilder("venta")
      .leftJoinAndSelect("venta.maquinaria", "maquinaria")
      .leftJoinAndSelect("venta.customer", "customer")
      .where("venta.fechaVenta >= :fechaInicio", { fechaInicio })
      .andWhere("venta.fechaVenta <= :fechaFin", { fechaFin })

    if (!incluirInactivas) {
      query.andWhere("venta.isActive = :isActive", { isActive: true })
    }

    return query.orderBy("venta.fechaVenta", "DESC").getMany()
  }

  async obtenerVentasPorCustomer(customerRut: string, incluirInactivas = false): Promise<VentaMaquinaria[]> {
    const query = this.ventaRepository
      .createQueryBuilder("venta")
      .leftJoinAndSelect("venta.maquinaria", "maquinaria")
      .leftJoinAndSelect("venta.customer", "customer")
      .where("venta.customerRut = :customerRut", { customerRut })

    if (!incluirInactivas) {
      query.andWhere("venta.isActive = :isActive", { isActive: true })
    }

    return query.orderBy("venta.fechaVenta", "DESC").getMany()
  }

  // Método para verificar estado de ventas de una maquinaria (útil para el frontend)
  async verificarEstadoVentas(patente: string): Promise<{
    tieneVentaActiva: boolean
    ventaActiva?: VentaMaquinaria
    ventasEliminadas: VentaMaquinaria[]
    puedeVender: boolean
  }> {
    const maquinaria = await this.maquinariaRepository.findOne({
      where: { patente, isActive: true },
    })

    if (!maquinaria) {
      throw new Error(`Maquinaria con patente ${patente} no encontrada`)
    }

    const ventas = await this.ventaRepository.find({
      where: { maquinariaId: maquinaria.id },
      relations: ["customer"],
      order: { fechaVenta: "DESC" },
    })

    const ventaActiva = ventas.find((v) => v.isActive === true)
    const ventasEliminadas = ventas.filter((v) => v.isActive === false)

    return {
      tieneVentaActiva: !!ventaActiva,
      ventaActiva,
      ventasEliminadas,
      puedeVender: !ventaActiva && maquinaria.estado === EstadoMaquinaria.DISPONIBLE,
    }
  }

  // Método para soft delete con actualización de estado de maquinaria
  async eliminarVenta(id: number): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Obtener la venta con la maquinaria relacionada
      const venta = await queryRunner.manager.findOne(VentaMaquinaria, {
        where: { id, isActive: true },
        relations: ["maquinaria"],
      })

      if (!venta) {
        throw new Error(`Venta con ID ${id} no encontrada o ya está inactiva`)
      }

      // Verificar que la maquinaria existe y está activa
      const maquinaria = await queryRunner.manager.findOne(Maquinaria, {
        where: { id: venta.maquinariaId, isActive: true },
      })

      if (!maquinaria) {
        throw new Error(`Maquinaria asociada a la venta no encontrada`)
      }

      // Verificar que no hay otras ventas activas para esta maquinaria
      const otrasVentasActivas = await queryRunner.manager.count(VentaMaquinaria, {
        where: {
          maquinariaId: venta.maquinariaId,
          isActive: true,
        },
      })

      // Solo debería haber 1 venta activa (la que estamos eliminando)
      if (otrasVentasActivas !== 1) {
        throw new Error(
          `Estado inconsistente: se encontraron ${otrasVentasActivas} ventas activas para esta maquinaria`,
        )
      }

      // Cambiar estado de maquinaria a disponible
      await queryRunner.manager.update(Maquinaria, { id: venta.maquinariaId }, { estado: EstadoMaquinaria.DISPONIBLE })

      // Hacer soft delete de la venta
      await queryRunner.manager.update(VentaMaquinaria, { id }, { isActive: false })

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  // Método para restaurar venta con actualización de estado de maquinaria
  async restaurarVenta(id: number): Promise<VentaMaquinaria> {
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Obtener la venta inactiva
      const venta = await queryRunner.manager.findOne(VentaMaquinaria, {
        where: { id, isActive: false },
        relations: ["maquinaria", "customer"],
      })

      if (!venta) {
        throw new Error(`Venta con ID ${id} no encontrada o ya está activa`)
      }

      // Verificar que la maquinaria existe y está activa
      const maquinaria = await queryRunner.manager.findOne(Maquinaria, {
        where: { id: venta.maquinariaId, isActive: true },
      })

      if (!maquinaria) {
        throw new Error(`Maquinaria asociada a la venta no encontrada o está inactiva`)
      }

      // NUEVA VALIDACIÓN: Verificar que no hay otras ventas activas
      const ventasActivas = await queryRunner.manager.count(VentaMaquinaria, {
        where: {
          maquinariaId: venta.maquinariaId,
          isActive: true,
        },
      })

      if (ventasActivas > 0) {
        throw new Error(`No se puede restaurar la venta. La maquinaria ya tiene una venta activa.`)
      }

      // Verificar que la maquinaria esté disponible para ser vendida nuevamente
      if (maquinaria.estado !== EstadoMaquinaria.DISPONIBLE) {
        throw new Error(
          `No se puede restaurar la venta. La maquinaria está en estado: ${maquinaria.estado}. Debe estar disponible.`,
        )
      }

      // Cambiar estado de maquinaria a vendida
      await queryRunner.manager.update(Maquinaria, { id: venta.maquinariaId }, { estado: EstadoMaquinaria.VENDIDA })

      // Restaurar la venta
      await queryRunner.manager.update(VentaMaquinaria, { id }, { isActive: true })

      await queryRunner.commitTransaction()

      // Retornar la venta restaurada con sus relaciones
      return await this.obtenerVentaPorId(id)
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }
}
