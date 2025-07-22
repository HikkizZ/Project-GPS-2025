import type { Repository } from "typeorm"
import { ArriendoMaquinaria } from "../../entity/maquinaria/arriendoMaquinaria.entity.js"
import { Maquinaria, EstadoMaquinaria } from "../../entity/maquinaria/maquinaria.entity.js"
import { AppDataSource } from "../../config/configDB.js"
import { limpiarRut } from "../../utils/rutValidator.js"

export class ArriendoMaquinariaService {
  private arriendoRepository: Repository<ArriendoMaquinaria>
  private maquinariaRepository: Repository<Maquinaria>

  constructor() {
    this.arriendoRepository = AppDataSource.getRepository(ArriendoMaquinaria)
    this.maquinariaRepository = AppDataSource.getRepository(Maquinaria)
  }

  async crearReporteTrabajo(reporteData: Partial<ArriendoMaquinaria>): Promise<ArriendoMaquinaria> {
    // Verificar número de reporte único
    const reporteExistente = await this.arriendoRepository.findOne({
      where: { numeroReporte: reporteData.numeroReporte },
    })

    if (reporteExistente) {
      throw new Error(`Ya existe un reporte con el número: ${reporteData.numeroReporte}`)
    }

    // Buscar maquinaria
    const maquinaria = await this.maquinariaRepository.findOne({
      where: { patente: reporteData.patente },
    })

    if (!maquinaria) {
      throw new Error(`Maquinaria con patente ${reporteData.patente} no encontrada`)
    }

    if (maquinaria.estado !== EstadoMaquinaria.DISPONIBLE) {
      throw new Error(`La maquinaria no está disponible`)
    }

    // Validar kilometraje
    if (reporteData.kmFinal! <= maquinaria.kilometrajeActual) {
      throw new Error(`El kilometraje final debe ser mayor al actual`)
    }

    // Limpiar RUT
    if (reporteData.rutCliente) {
      reporteData.rutCliente = limpiarRut(reporteData.rutCliente)
    }

    // Crear reporte
    const nuevoReporte = this.arriendoRepository.create({
      ...reporteData,
      maquinariaId: maquinaria.id,
      patente: maquinaria.patente,
      marca: maquinaria.marca,
      modelo: maquinaria.modelo,
    })

    const reporteGuardado = await this.arriendoRepository.save(nuevoReporte)

    // Actualizar kilometraje de la maquinaria
    await this.maquinariaRepository.update(maquinaria.id, {
      kilometrajeActual: reporteData.kmFinal!,
    })

    return reporteGuardado
  }

  async obtenerTodosLosReportes(): Promise<ArriendoMaquinaria[]> {
    return this.arriendoRepository.find({
      relations: ["maquinaria"],
      order: { fechaTrabajo: "DESC" },
    })
  }

  async obtenerReportePorId(id: number): Promise<ArriendoMaquinaria> {
    const reporte = await this.arriendoRepository.findOne({
      where: { id },
      relations: ["maquinaria"],
    })

    if (!reporte) {
      throw new Error(`Reporte con ID ${id} no encontrado`)
    }

    return reporte
  }

  async obtenerReportesPorPatente(patente: string): Promise<ArriendoMaquinaria[]> {
    return this.arriendoRepository.find({
      where: { patente },
      relations: ["maquinaria"],
      order: { fechaTrabajo: "DESC" },
    })
  }

  async obtenerReportesPorCliente(rutCliente: string): Promise<ArriendoMaquinaria[]> {
    const rutLimpio = limpiarRut(rutCliente)
    return this.arriendoRepository.find({
      where: { rutCliente: rutLimpio },
      relations: ["maquinaria"],
      order: { fechaTrabajo: "DESC" },
    })
  }

  async obtenerReportesPorFecha(fechaInicio: Date, fechaFin: Date): Promise<ArriendoMaquinaria[]> {
    return this.arriendoRepository.find({
      where: {
        fechaTrabajo: {
          $gte: fechaInicio,
          $lte: fechaFin,
        } as any,
      },
      relations: ["maquinaria"],
      order: { fechaTrabajo: "DESC" },
    })
  }

  async actualizarReporte(id: number, datosActualizacion: Partial<ArriendoMaquinaria>): Promise<ArriendoMaquinaria> {
    const reporte = await this.obtenerReportePorId(id)

    if (datosActualizacion.rutCliente) {
      datosActualizacion.rutCliente = limpiarRut(datosActualizacion.rutCliente)
    }

    Object.assign(reporte, datosActualizacion)
    return this.arriendoRepository.save(reporte)
  }

  async eliminarReporte(id: number): Promise<void> {
    const reporte = await this.obtenerReportePorId(id)
    await this.arriendoRepository.remove(reporte)
  }
}
