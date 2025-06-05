import type { Repository } from "typeorm"
import { type Conductor, TipoLicencia } from "../../entity/maquinaria/conductor.entity.js"
import type { Maquinaria } from "../../entity/maquinaria/maquinaria.entity.js"

export class ConductorService {
  constructor(
    private conductorRepository: Repository<Conductor>,
    private maquinariaRepository: Repository<Maquinaria>,
  ) {}

  // ==================== CRUD BÁSICO ====================

  /**
   * Crear un nuevo conductor
   */
  async crear(datosConductor: {
    rut: string
    nombre: string
    tipoLicencia: TipoLicencia
    fechaNacimiento: Date
  }): Promise<Conductor> {
    // Verificar que el RUT no exista
    const conductorExistente = await this.obtenerPorRut(datosConductor.rut)
    if (conductorExistente) {
      throw new Error("Ya existe un conductor con este RUT")
    }

    const conductor = this.conductorRepository.create(datosConductor)
    return await this.conductorRepository.save(conductor)
  }

  /**
   * Obtener todos los conductores
   */
  async obtenerTodos(): Promise<Conductor[]> {
    return await this.conductorRepository.find({
      relations: ["maquinarias"],
      order: { nombre: "ASC" },
    })
  }

  /**
   * Obtener conductor por ID
   */
  async obtenerPorId(id: number): Promise<Conductor | null> {
    return await this.conductorRepository.findOne({
      where: { id },
      relations: ["maquinarias"],
    })
  }

  /**
   * Obtener conductor por RUT
   */
  async obtenerPorRut(rut: string): Promise<Conductor | null> {
    return await this.conductorRepository.findOne({
      where: { rut },
      relations: ["maquinarias"],
    })
  }

  /**
   * Actualizar un conductor
   */
  async actualizar(id: number, datosActualizacion: Partial<Conductor>): Promise<Conductor> {
    const conductor = await this.obtenerPorId(id)

    if (!conductor) {
      throw new Error("Conductor no encontrado")
    }

    // Si se está actualizando el RUT, verificar que no exista otro conductor con ese RUT
    if (datosActualizacion.rut && datosActualizacion.rut !== conductor.rut) {
      const conductorConRut = await this.obtenerPorRut(datosActualizacion.rut)
      if (conductorConRut) {
        throw new Error("Ya existe un conductor con este RUT")
      }
    }

    // Actualizar campos (excluyendo relaciones)
    const { maquinarias, ...datosParaActualizar } = datosActualizacion as any
    Object.assign(conductor, datosParaActualizar)

    return await this.conductorRepository.save(conductor)
  }

  /**
   * Eliminar un conductor
   */
  async eliminar(id: number): Promise<void> {
    const conductor = await this.obtenerPorId(id)

    if (!conductor) {
      throw new Error("Conductor no encontrado")
    }

    // Verificar si tiene maquinarias asignadas
    if (conductor.maquinarias && conductor.maquinarias.length > 0) {
      throw new Error("No se puede eliminar un conductor que tiene maquinarias asignadas")
    }

    await this.conductorRepository.remove(conductor)
  }

  // ==================== MÉTODOS ESPECÍFICOS ====================

  /**
   * Asignar maquinaria a un conductor
   */
  async asignarMaquinaria(conductorId: number, maquinariaId: number): Promise<Conductor> {
    const conductor = await this.obtenerPorId(conductorId)
    if (!conductor) {
      throw new Error("Conductor no encontrado")
    }

    const maquinaria = await this.maquinariaRepository.findOne({
      where: { id: maquinariaId },
    })
    if (!maquinaria) {
      throw new Error("Maquinaria no encontrada")
    }

    // Verificar si ya está asignada
    const yaAsignada = conductor.maquinarias.some((m) => m.id === maquinariaId)
    if (yaAsignada) {
      throw new Error("La maquinaria ya está asignada a este conductor")
    }

    conductor.maquinarias.push(maquinaria)
    return await this.conductorRepository.save(conductor)
  }

  /**
   * Desasignar maquinaria de un conductor
   */
  async desasignarMaquinaria(conductorId: number, maquinariaId: number): Promise<Conductor> {
    const conductor = await this.obtenerPorId(conductorId)
    if (!conductor) {
      throw new Error("Conductor no encontrado")
    }

    conductor.maquinarias = conductor.maquinarias.filter((m) => m.id !== maquinariaId)
    return await this.conductorRepository.save(conductor)
  }

  /**
   * Obtener conductores por tipo de licencia
   */
  async obtenerPorTipoLicencia(tipoLicencia: TipoLicencia): Promise<Conductor[]> {
    return await this.conductorRepository.find({
      where: { tipoLicencia },
      relations: ["maquinarias"],
      order: { nombre: "ASC" },
    })
  }

  /**
   * Buscar conductores por múltiples criterios
   */
  async buscar(criterios: {
    nombre?: string
    rut?: string
    tipoLicencia?: TipoLicencia
    edadMinima?: number
    edadMaxima?: number
    conMaquinarias?: boolean
  }): Promise<Conductor[]> {
    const queryBuilder = this.conductorRepository
      .createQueryBuilder("conductor")
      .leftJoinAndSelect("conductor.maquinarias", "maquinaria")

    if (criterios.nombre) {
      queryBuilder.andWhere("conductor.nombre LIKE :nombre", { nombre: `%${criterios.nombre}%` })
    }

    if (criterios.rut) {
      queryBuilder.andWhere("conductor.rut LIKE :rut", { rut: `%${criterios.rut}%` })
    }

    if (criterios.tipoLicencia) {
      queryBuilder.andWhere("conductor.tipoLicencia = :tipoLicencia", { tipoLicencia: criterios.tipoLicencia })
    }

    if (criterios.conMaquinarias !== undefined) {
      if (criterios.conMaquinarias) {
        queryBuilder.andWhere("maquinaria.id IS NOT NULL")
      } else {
        queryBuilder.andWhere("maquinaria.id IS NULL")
      }
    }

    const conductores = await queryBuilder.orderBy("conductor.nombre", "ASC").getMany()

    // Filtrar por edad si se especifica (ya que la edad es calculada)
    if (criterios.edadMinima !== undefined || criterios.edadMaxima !== undefined) {
      return conductores.filter((conductor) => {
        const edad = conductor.edad
        if (criterios.edadMinima !== undefined && edad < criterios.edadMinima) return false
        if (criterios.edadMaxima !== undefined && edad > criterios.edadMaxima) return false
        return true
      })
    }

    return conductores
  }

  /**
   * Obtener conductores disponibles (sin maquinarias asignadas)
   */
  async obtenerConductoresDisponibles(): Promise<Conductor[]> {
    return await this.buscar({ conMaquinarias: false })
  }

  /**
   * Obtener estadísticas de conductores
   */
  async obtenerEstadisticas(): Promise<{
    total: number
    conMaquinarias: number
    sinMaquinarias: number
    porTipoLicencia: Record<TipoLicencia, number>
    edadPromedio: number
  }> {
    const todosConductores = await this.obtenerTodos()

    const total = todosConductores.length
    const conMaquinarias = todosConductores.filter((c) => c.maquinarias.length > 0).length
    const sinMaquinarias = total - conMaquinarias

    const porTipoLicencia = {} as Record<TipoLicencia, number>
    Object.values(TipoLicencia).forEach((tipo) => {
      porTipoLicencia[tipo] = todosConductores.filter((c) => c.tipoLicencia === tipo).length
    })

    const edadPromedio = total > 0 ? todosConductores.reduce((sum, c) => sum + c.edad, 0) / total : 0

    return {
      total,
      conMaquinarias,
      sinMaquinarias,
      porTipoLicencia,
      edadPromedio,
    }
  }

  /**
   * Validar RUT chileno (formato básico)
   */
  private validarRut(rut: string): boolean {
    // Implementación básica de validación de RUT chileno
    const rutLimpio = rut.replace(/[^0-9kK]/g, "")
    if (rutLimpio.length < 8 || rutLimpio.length > 9) return false

    const cuerpo = rutLimpio.slice(0, -1)
    const dv = rutLimpio.slice(-1).toUpperCase()

    let suma = 0
    let multiplicador = 2

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += Number.parseInt(cuerpo[i]) * multiplicador
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1
    }

    const dvCalculado = 11 - (suma % 11)
    const dvEsperado = dvCalculado === 11 ? "0" : dvCalculado === 10 ? "K" : dvCalculado.toString()

    return dv === dvEsperado
  }
}
