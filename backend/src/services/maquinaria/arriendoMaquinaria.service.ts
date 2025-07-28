import type { Repository } from "typeorm"
import { ArriendoMaquinaria } from "../../entity/maquinaria/arriendoMaquinaria.entity.js"
import { Maquinaria, EstadoMaquinaria } from "../../entity/maquinaria/maquinaria.entity.js"
import { Customer } from "../../entity/stakeholders/customer.entity.js"
import { AppDataSource } from "../../config/configDB.js"
import { limpiarRut } from "../../utils/rutValidator.js"

export class ArriendoMaquinariaService {
  private arriendoRepository: Repository<ArriendoMaquinaria>
  private maquinariaRepository: Repository<Maquinaria>
  private customerRepository: Repository<Customer>

  constructor() {
    this.arriendoRepository = AppDataSource.getRepository(ArriendoMaquinaria)
    this.maquinariaRepository = AppDataSource.getRepository(Maquinaria)
    this.customerRepository = AppDataSource.getRepository(Customer)
  }

  async crearReporteTrabajo(reporteData: Partial<ArriendoMaquinaria>, userRole?: string): Promise<ArriendoMaquinaria> {
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Verificar número de reporte único (incluyendo soft deleted)
      const reporteExistente = await queryRunner.manager.findOne(ArriendoMaquinaria, {
        where: { numeroReporte: reporteData.numeroReporte },
        withDeleted: true, // Incluir registros eliminados
      })

      // Si existe un reporte en soft delete y el usuario es SuperAdministrador
      if (reporteExistente && reporteExistente.isActive === false && userRole === "SuperAdministrador") {
        console.log(` SuperAdmin: Actualizando reporte soft-deleted ${reporteData.numeroReporte}`)

        // Limpiar y validar RUT del cliente
        const rutLimpio = limpiarRut(reporteData.rutCliente!)

        // Validar que el customer existe y está activo
        const customer = await queryRunner.manager.findOne(Customer, {
          where: [
            { rut: rutLimpio, isActive: true },
            { rut: reporteData.rutCliente!, isActive: true },
          ],
        })

        if (!customer) {
          throw new Error(`Cliente con RUT ${reporteData.rutCliente} no encontrado o inactivo`)
        }

        // Buscar maquinaria activa
        const maquinaria = await queryRunner.manager.findOne(Maquinaria, {
          where: { patente: reporteData.patente, isActive: true },
        })

        if (!maquinaria) {
          throw new Error(`Maquinaria con patente ${reporteData.patente} no encontrada o inactiva`)
        }

        if (maquinaria.estado !== EstadoMaquinaria.DISPONIBLE) {
          throw new Error(`La maquinaria no está disponible`)
        }

        // Validaciones de kilometraje
        if (!reporteData.kmFinal || reporteData.kmFinal <= 0) {
          throw new Error("El kilometraje final debe ser mayor a 0")
        }

        if (reporteData.kmFinal <= maquinaria.kilometrajeActual) {
          throw new Error(
            `El kilometraje final (${reporteData.kmFinal}) debe ser mayor al actual (${maquinaria.kilometrajeActual})`,
          )
        }

        const incrementoKm = reporteData.kmFinal - maquinaria.kilometrajeActual
        if (incrementoKm > 1000) {
          throw new Error(`El incremento de kilometraje (${incrementoKm}km) parece excesivo. Máximo permitido: 1000km`)
        }

        // Actualizar el reporte existente con los nuevos datos
        const reporteActualizado = await queryRunner.manager.save(ArriendoMaquinaria, {
          ...reporteExistente, 
          ...reporteData, 
          maquinariaId: maquinaria.id,
          patente: maquinaria.patente,
          marca: maquinaria.marca,
          modelo: maquinaria.modelo,
          rutCliente: customer.rut,
          nombreCliente: customer.name,
          customerId: customer.id,
          kmInicial: maquinaria.kilometrajeActual,
          isActive: true,
          updatedAt: new Date(), 
        })

        // Actualizar kilometraje de la maquinaria
        await queryRunner.manager.update(Maquinaria, { id: maquinaria.id }, { kilometrajeActual: reporteData.kmFinal! })

        await queryRunner.commitTransaction()

        console.log(` SuperAdmin: Reporte ${reporteData.numeroReporte} actualizado y reactivado exitosamente`)
        return reporteActualizado
      }

      // Si existe un reporte activo, lanzar error
      if (reporteExistente && reporteExistente.isActive !== false) {
        throw new Error(`Ya existe un reporte activo con el número: ${reporteData.numeroReporte}`)
      }

      // Si existe un reporte en soft delete pero el usuario NO es SuperAdmin
      if (reporteExistente && reporteExistente.isActive === false && userRole !== "SuperAdministrador") {
        throw new Error(
          `Ya existe un reporte con el número: ${reporteData.numeroReporte}. Solo un SuperAdministrador puede reutilizar números de reportes eliminados.`,
        )
      }

      // Crear nuevo reporte
      const rutLimpio = limpiarRut(reporteData.rutCliente!)

      const customer = await queryRunner.manager.findOne(Customer, {
        where: [
          { rut: rutLimpio, isActive: true },
          { rut: reporteData.rutCliente!, isActive: true },
        ],
      })

      if (!customer) {
        throw new Error(`Cliente con RUT ${reporteData.rutCliente} no encontrado o inactivo`)
      }

      const maquinaria = await queryRunner.manager.findOne(Maquinaria, {
        where: { patente: reporteData.patente, isActive: true },
      })

      if (!maquinaria) {
        throw new Error(`Maquinaria con patente ${reporteData.patente} no encontrada o inactiva`)
      }

      if (maquinaria.estado !== EstadoMaquinaria.DISPONIBLE) {
        throw new Error(`La maquinaria no está disponible`)
      }

      if (!reporteData.kmFinal || reporteData.kmFinal <= 0) {
        throw new Error("El kilometraje final debe ser mayor a 0")
      }

      if (reporteData.kmFinal <= maquinaria.kilometrajeActual) {
        throw new Error(
          `El kilometraje final (${reporteData.kmFinal}) debe ser mayor al actual (${maquinaria.kilometrajeActual})`,
        )
      }

      const incrementoKm = reporteData.kmFinal - maquinaria.kilometrajeActual
      if (incrementoKm > 1000) {
        throw new Error(`El incremento de kilometraje (${incrementoKm}km) parece excesivo. Máximo permitido: 1000km`)
      }

      // Crear nuevo reporte
      const nuevoReporte = queryRunner.manager.create(ArriendoMaquinaria, {
        ...reporteData,
        maquinariaId: maquinaria.id,
        patente: maquinaria.patente,
        marca: maquinaria.marca,
        modelo: maquinaria.modelo,
        rutCliente: customer.rut,
        nombreCliente: customer.name,
        customerId: customer.id,
        kmInicial: maquinaria.kilometrajeActual,
      })

      const reporteGuardado = await queryRunner.manager.save(nuevoReporte)

      // Actualizar kilometraje de la maquinaria
      await queryRunner.manager.update(Maquinaria, { id: maquinaria.id }, { kilometrajeActual: reporteData.kmFinal! })

      await queryRunner.commitTransaction()
      return reporteGuardado
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  //  Función para incluir soft deleted
  async obtenerTodosLosReportes(incluirInactivas = false): Promise<ArriendoMaquinaria[]> {
    const query = this.arriendoRepository
      .createQueryBuilder("arriendo")
      .leftJoinAndSelect("arriendo.maquinaria", "maquinaria")
      .leftJoinAndSelect("arriendo.customer", "customer")

    // incluirInactivas es true, mostrar TODOS los registros (activos e inactivos)
    if (incluirInactivas) {
      // No aplicar filtro de isActive, mostrar todos
      query.orderBy("arriendo.fechaTrabajo", "DESC").addOrderBy("arriendo.isActive", "DESC") // Mostrar activos primero
    } else {
      // Solo mostrar activos
      query.where("arriendo.isActive = :isActive", { isActive: true }).orderBy("arriendo.fechaTrabajo", "DESC")
    }

    return query.getMany()
  }

  async obtenerReportePorId(id: number, incluirInactivas = false): Promise<ArriendoMaquinaria> {
    const whereCondition = incluirInactivas ? { id } : { id, isActive: true }

    const reporte = await this.arriendoRepository.findOne({
      where: whereCondition,
      relations: ["maquinaria", "customer"],
    })

    if (!reporte) {
      throw new Error(`Reporte con ID ${id} no encontrado`)
    }

    return reporte
  }

  async obtenerReportesPorPatente(patente: string, incluirInactivas = false): Promise<ArriendoMaquinaria[]> {
    const query = this.arriendoRepository
      .createQueryBuilder("arriendo")
      .leftJoinAndSelect("arriendo.maquinaria", "maquinaria")
      .leftJoinAndSelect("arriendo.customer", "customer")
      .where("arriendo.patente = :patente", { patente })

    if (incluirInactivas) {
      query.orderBy("arriendo.fechaTrabajo", "DESC").addOrderBy("arriendo.isActive", "DESC")
    } else {
      query.andWhere("arriendo.isActive = :isActive", { isActive: true }).orderBy("arriendo.fechaTrabajo", "DESC")
    }

    return query.getMany()
  }

  async obtenerReportesPorCliente(rutCliente: string, incluirInactivas = false): Promise<ArriendoMaquinaria[]> {
    if (!rutCliente || typeof rutCliente !== "string") {
      throw new Error("RUT de cliente inválido")
    }

    const rutLimpio = limpiarRut(rutCliente)

    const query = this.arriendoRepository
      .createQueryBuilder("arriendo")
      .leftJoinAndSelect("arriendo.maquinaria", "maquinaria")
      .leftJoinAndSelect("arriendo.customer", "customer")
      .where("arriendo.rutCliente = :rutCliente OR arriendo.rutCliente = :rutLimpio", {
        rutCliente,
        rutLimpio,
      })

    if (incluirInactivas) {
      query.orderBy("arriendo.fechaTrabajo", "DESC").addOrderBy("arriendo.isActive", "DESC")
    } else {
      query.andWhere("arriendo.isActive = :isActive", { isActive: true }).orderBy("arriendo.fechaTrabajo", "DESC")
    }

    return query.getMany()
  }

  async obtenerReportesPorFecha(
    fechaInicio: Date,
    fechaFin: Date,
    incluirInactivas = false,
  ): Promise<ArriendoMaquinaria[]> {
    if (!fechaInicio || !fechaFin || fechaInicio > fechaFin) {
      throw new Error("Rango de fechas inválido")
    }

    const query = this.arriendoRepository
      .createQueryBuilder("arriendo")
      .leftJoinAndSelect("arriendo.maquinaria", "maquinaria")
      .leftJoinAndSelect("arriendo.customer", "customer")
      .where("arriendo.fechaTrabajo >= :fechaInicio", { fechaInicio })
      .andWhere("arriendo.fechaTrabajo <= :fechaFin", { fechaFin })

    if (incluirInactivas) {
      query.orderBy("arriendo.fechaTrabajo", "DESC").addOrderBy("arriendo.isActive", "DESC")
    } else {
      query.andWhere("arriendo.isActive = :isActive", { isActive: true }).orderBy("arriendo.fechaTrabajo", "DESC")
    }

    return query.getMany()
  }

  async actualizarReporte(id: number, datosActualizacion: Partial<ArriendoMaquinaria>): Promise<ArriendoMaquinaria> {
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Validar que el ID sea válido
      if (!id || id <= 0) {
        throw new Error("ID de reporte inválido")
      }

      const reporte = await this.obtenerReportePorId(id)

      // Si se actualiza el RUT del cliente, validar que existe
      if (datosActualizacion.rutCliente) {
        const rutLimpio = limpiarRut(datosActualizacion.rutCliente)

        const customer = await queryRunner.manager.findOne(Customer, {
          where: [
            { rut: rutLimpio, isActive: true },
            { rut: datosActualizacion.rutCliente, isActive: true },
          ],
        })

        if (!customer) {
          throw new Error(`Cliente con RUT ${datosActualizacion.rutCliente} no encontrado o inactivo`)
        }

        datosActualizacion.rutCliente = customer.rut
        datosActualizacion.nombreCliente = customer.name
        datosActualizacion.customerId = customer.id
      }

      // Si se actualiza el kilometraje final, recalcular el kilometraje de la maquinaria
      if (datosActualizacion.kmFinal && datosActualizacion.kmFinal !== reporte.kmFinal) {
        const maquinaria = await queryRunner.manager.findOne(Maquinaria, {
          where: { id: reporte.maquinariaId },
        })

        if (!maquinaria) {
          throw new Error("Maquinaria no encontrada")
        }

        // Validar que el nuevo kilometraje sea mayor al inicial del reporte
        if (datosActualizacion.kmFinal <= reporte.kmInicial!) {
          throw new Error(`El kilometraje final debe ser mayor al inicial (${reporte.kmInicial})`)
        }

        // Validar incremento razonable
        const incremento = datosActualizacion.kmFinal - reporte.kmInicial!
        if (incremento > 1000) {
          throw new Error(`El incremento de kilometraje (${incremento}km) parece excesivo`)
        }

        // Recalcular el kilometraje de la maquinaria
        const diferencia = datosActualizacion.kmFinal - reporte.kmFinal
        const nuevoKilometraje = maquinaria.kilometrajeActual + diferencia

        await queryRunner.manager.update(Maquinaria, { id: maquinaria.id }, { kilometrajeActual: nuevoKilometraje })
      }

      Object.assign(reporte, datosActualizacion)
      const reporteActualizado = await queryRunner.manager.save(reporte)

      await queryRunner.commitTransaction()
      return reporteActualizado
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async eliminarReporte(id: number): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      if (!id || id <= 0) {
        throw new Error("ID de reporte inválido")
      }

      const reporte = await queryRunner.manager.findOne(ArriendoMaquinaria, {
        where: { id, isActive: true },
      })

      if (!reporte) {
        throw new Error(`Reporte con ID ${id} no encontrado o ya está inactivo`)
      }
      // Hacer soft delete del reporte
      await queryRunner.manager.update(ArriendoMaquinaria, { id }, { isActive: false })

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async restaurarReporte(id: number): Promise<ArriendoMaquinaria> {
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      if (!id || id <= 0) {
        throw new Error("ID de reporte inválido")
      }

      const reporte = await queryRunner.manager.findOne(ArriendoMaquinaria, {
        where: { id, isActive: false },
        relations: ["maquinaria", "customer"],
      })

      if (!reporte) {
        throw new Error(`Reporte con ID ${id} no encontrado o ya está activo`)
      }

      // Restaurar el reporte
      await queryRunner.manager.update(ArriendoMaquinaria, { id }, { isActive: true })

      await queryRunner.commitTransaction()

      // Retornar el reporte restaurado
      return await this.obtenerReportePorId(id)
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  // Método para verificar la integridad del kilometraje
  async verificarIntegridadKilometraje(maquinariaId: number): Promise<{
    esConsistente: boolean
    kilometrajeCalculado: number
    kilometrajeActual: number
    diferencia: number
  }> {
    if (!maquinariaId || maquinariaId <= 0) {
      throw new Error("ID de maquinaria inválido")
    }

    const maquinaria = await this.maquinariaRepository.findOne({
      where: { id: maquinariaId, isActive: true },
    })

    if (!maquinaria) {
      throw new Error("Maquinaria no encontrada")
    }

    // Obtener todos los reportes activos ordenados por fecha
    const reportes = await this.arriendoRepository.find({
      where: { maquinariaId, isActive: true },
      order: { fechaTrabajo: "ASC" },
    })

    let kilometrajeCalculado = maquinaria.kilometrajeInicial

    // Calcular el kilometraje basado en los reportes
    for (const reporte of reportes) {
      if (reporte.kmFinal > kilometrajeCalculado) {
        kilometrajeCalculado = reporte.kmFinal
      }
    }

    const diferencia = maquinaria.kilometrajeActual - kilometrajeCalculado

    return {
      esConsistente: diferencia === 0,
      kilometrajeCalculado,
      kilometrajeActual: maquinaria.kilometrajeActual,
      diferencia,
    }
  }

  // Método para corregir inconsistencias de kilometraje
  async corregirKilometraje(maquinariaId: number): Promise<void> {
    const verificacion = await this.verificarIntegridadKilometraje(maquinariaId)

    if (!verificacion.esConsistente) {
      await this.maquinariaRepository.update(maquinariaId, {
        kilometrajeActual: verificacion.kilometrajeCalculado,
      })
    }
  }
}
