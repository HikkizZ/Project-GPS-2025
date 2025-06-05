import type { Repository } from "typeorm"
import { type Maquinaria, GrupoMaquinaria } from "../../entity/maquinaria/maquinaria.entity.js"
import type { Conductor } from "../../entity/maquinaria/conductor.entity.js"

export class MaquinariaService {
  constructor(
    private maquinariaRepository: Repository<Maquinaria>,
    private conductorRepository: Repository<Conductor>,
  ) {}

  // ==================== CRUD BÁSICO ====================

  /**
   * Crear una nueva maquinaria
   */
  async crear(datosMaquinaria: {
    patente: string
    grupo: GrupoMaquinaria
    marca: string
    modelo: string
    año: number
    fechaCompra: Date
    valorCompra: number
    avaluoFiscal: number
    numeroChasis?: string
    kilometrajeInicial: number
    kilometrajeActual: number
  }): Promise<Maquinaria> {
    // Verificar que la patente no exista
    const maquinariaExistente = await this.obtenerPorPatente(datosMaquinaria.patente)
    if (maquinariaExistente) {
      throw new Error("Ya existe una maquinaria con esta patente")
    }

    const maquinaria = this.maquinariaRepository.create(datosMaquinaria)
    return await this.maquinariaRepository.save(maquinaria)
  }

  /**
   * Obtener todas las maquinarias
   */
  async obtenerTodos(): Promise<Maquinaria[]> {
    return await this.maquinariaRepository.find({
      relations: ["conductores"],
      order: { patente: "ASC" },
    })
  }

  /**
   * Obtener maquinaria por ID
   */
  async obtenerPorId(id: number): Promise<Maquinaria | null> {
    return await this.maquinariaRepository.findOne({
      where: { id },
      relations: ["conductores"],
    })
  }

  /**
   * Obtener maquinaria por patente
   */
  async obtenerPorPatente(patente: string): Promise<Maquinaria | null> {
    return await this.maquinariaRepository.findOne({
      where: { patente },
      relations: ["conductores"],
    })
  }

  /**
   * Actualizar una maquinaria
   */
  async actualizar(id: number, datosActualizacion: Partial<Maquinaria>): Promise<Maquinaria> {
    const maquinaria = await this.obtenerPorId(id)

    if (!maquinaria) {
      throw new Error("Maquinaria no encontrada")
    }

    // Si se está actualizando la patente, verificar que no exista otra maquinaria con esa patente
    if (datosActualizacion.patente && datosActualizacion.patente !== maquinaria.patente) {
      const maquinariaConPatente = await this.obtenerPorPatente(datosActualizacion.patente)
      if (maquinariaConPatente) {
        throw new Error("Ya existe una maquinaria con esta patente")
      }
    }

    // Actualizar campos (excluyendo relaciones)
    const { conductores, ...datosParaActualizar } = datosActualizacion as any
    Object.assign(maquinaria, datosParaActualizar)

    return await this.maquinariaRepository.save(maquinaria)
  }

  /**
   * Eliminar una maquinaria
   */
  async eliminar(id: number): Promise<void> {
    const maquinaria = await this.obtenerPorId(id)

    if (!maquinaria) {
      throw new Error("Maquinaria no encontrada")
    }

    await this.maquinariaRepository.remove(maquinaria)
  }

  // ==================== MÉTODOS ESPECÍFICOS ====================

  /**
   * Asignar conductor a una maquinaria
   */
  async asignarConductor(maquinariaId: number, conductorId: number): Promise<Maquinaria> {
    const maquinaria = await this.obtenerPorId(maquinariaId)
    if (!maquinaria) {
      throw new Error("Maquinaria no encontrada")
    }

    const conductor = await this.conductorRepository.findOne({
      where: { id: conductorId },
    })
    if (!conductor) {
      throw new Error("Conductor no encontrado")
    }

    // Verificar si ya está asignado
    const yaAsignado = maquinaria.conductores.some((c) => c.id === conductorId)
    if (yaAsignado) {
      throw new Error("El conductor ya está asignado a esta maquinaria")
    }

    maquinaria.conductores.push(conductor)
    return await this.maquinariaRepository.save(maquinaria)
  }

  /**
   * Desasignar conductor de una maquinaria
   */
  async desasignarConductor(maquinariaId: number, conductorId: number): Promise<Maquinaria> {
    const maquinaria = await this.obtenerPorId(maquinariaId)
    if (!maquinaria) {
      throw new Error("Maquinaria no encontrada")
    }

    maquinaria.conductores = maquinaria.conductores.filter((c) => c.id !== conductorId)
    return await this.maquinariaRepository.save(maquinaria)
  }

  /**
   * Actualizar kilometraje
   */
  async actualizarKilometraje(id: number, nuevoKilometraje: number): Promise<Maquinaria> {
    const maquinaria = await this.obtenerPorId(id)

    if (!maquinaria) {
      throw new Error("Maquinaria no encontrada")
    }

    if (nuevoKilometraje < maquinaria.kilometrajeActual) {
      throw new Error("El nuevo kilometraje no puede ser menor al actual")
    }

    maquinaria.kilometrajeActual = nuevoKilometraje
    return await this.maquinariaRepository.save(maquinaria)
  }

  /**
   * Obtener maquinarias por grupo
   */
  async obtenerPorGrupo(grupo: GrupoMaquinaria): Promise<Maquinaria[]> {
    return await this.maquinariaRepository.find({
      where: { grupo },
      relations: ["conductores"],
      order: { patente: "ASC" },
    })
  }

  /**
   * Buscar maquinarias por múltiples criterios
   */
  async buscar(criterios: {
    patente?: string
    marca?: string
    modelo?: string
    grupo?: GrupoMaquinaria
    añoDesde?: number
    añoHasta?: number
    conConductores?: boolean
  }): Promise<Maquinaria[]> {
    const queryBuilder = this.maquinariaRepository
      .createQueryBuilder("maquinaria")
      .leftJoinAndSelect("maquinaria.conductores", "conductor")

    if (criterios.patente) {
      queryBuilder.andWhere("maquinaria.patente LIKE :patente", { patente: `%${criterios.patente}%` })
    }

    if (criterios.marca) {
      queryBuilder.andWhere("maquinaria.marca LIKE :marca", { marca: `%${criterios.marca}%` })
    }

    if (criterios.modelo) {
      queryBuilder.andWhere("maquinaria.modelo LIKE :modelo", { modelo: `%${criterios.modelo}%` })
    }

    if (criterios.grupo) {
      queryBuilder.andWhere("maquinaria.grupo = :grupo", { grupo: criterios.grupo })
    }

    if (criterios.añoDesde) {
      queryBuilder.andWhere("maquinaria.año >= :añoDesde", { añoDesde: criterios.añoDesde })
    }

    if (criterios.añoHasta) {
      queryBuilder.andWhere("maquinaria.año <= :añoHasta", { añoHasta: criterios.añoHasta })
    }

    if (criterios.conConductores !== undefined) {
      if (criterios.conConductores) {
        queryBuilder.andWhere("conductor.id IS NOT NULL")
      } else {
        queryBuilder.andWhere("conductor.id IS NULL")
      }
    }

    return await queryBuilder.orderBy("maquinaria.patente", "ASC").getMany()
  }

  /**
   * Obtener maquinarias disponibles (sin conductores asignados)
   */
  async obtenerMaquinariasDisponibles(): Promise<Maquinaria[]> {
    return await this.buscar({ conConductores: false })
  }

  /**
   * Obtener estadísticas de maquinarias
   */
  async obtenerEstadisticas(): Promise<{
    total: number
    conConductores: number
    sinConductores: number
    porGrupo: Record<GrupoMaquinaria, number>
    valorTotalInventario: number
    añoPromedio: number
  }> {
    const todasMaquinarias = await this.obtenerTodos()

    const total = todasMaquinarias.length
    const conConductores = todasMaquinarias.filter((m) => m.conductores.length > 0).length
    const sinConductores = total - conConductores

    const porGrupo = {} as Record<GrupoMaquinaria, number>
    Object.values(GrupoMaquinaria).forEach((grupo) => {
      porGrupo[grupo] = todasMaquinarias.filter((m) => m.grupo === grupo).length
    })

    const valorTotalInventario = todasMaquinarias.reduce((sum, m) => sum + Number(m.valorCompra), 0)
    const añoPromedio = total > 0 ? todasMaquinarias.reduce((sum, m) => sum + m.año, 0) / total : 0

    return {
      total,
      conConductores,
      sinConductores,
      porGrupo,
      valorTotalInventario,
      añoPromedio,
    }
  }
}