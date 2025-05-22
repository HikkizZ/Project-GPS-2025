import type { Repository } from "typeorm"
import { Maquinaria, GrupoMaquinaria } from "../../entity/maquinaria/maquinaria.entity.js"
import { AppDataSource } from "../../config/configDB.js"

export class MaquinariaService {
  private maquinariaRepository: Repository<Maquinaria>

  constructor() {
    this.maquinariaRepository = AppDataSource.getRepository(Maquinaria)
  }

  async create(maquinariaData: Partial<Maquinaria>): Promise<Maquinaria> {
    // Verificar si ya existe una maquinaria con la misma patente
    const maquinariaExistente = await this.maquinariaRepository.findOne({
      where: { patente: maquinariaData.patente },
    })

    if (maquinariaExistente) {
      throw new Error(`Ya existe una maquinaria con la patente ${maquinariaData.patente}`)
    }

    try {
      // Usar directamente save en lugar de create + save
      return await this.maquinariaRepository.save(maquinariaData)
    } catch (error: any) {
      console.error("Error al crear maquinaria:", error)
      throw new Error(`Error al crear la maquinaria: ${error.message || "Error desconocido"}`)
    }
  }

  async findAll(): Promise<Maquinaria[]> {
    return this.maquinariaRepository.find()
  }

  async findOne(id: number): Promise<Maquinaria> {
    const maquinaria = await this.maquinariaRepository.findOne({
      where: { id },
    })

    if (!maquinaria) {
      throw new Error(`Maquinaria con ID ${id} no encontrada`)
    }

    return maquinaria
  }

  async findByPatente(patente: string): Promise<Maquinaria> {
    const maquinaria = await this.maquinariaRepository.findOne({
      where: { patente },
    })

    if (!maquinaria) {
      throw new Error(`Maquinaria con patente ${patente} no encontrada`)
    }

    return maquinaria
  }

  async update(id: number, maquinariaData: Partial<Maquinaria>): Promise<Maquinaria> {
    const maquinaria = await this.findOne(id)

    // Si se está actualizando la patente, verificar que no exista otra maquinaria con esa patente
    if (maquinariaData.patente && maquinariaData.patente !== maquinaria.patente) {
      const maquinariaExistente = await this.maquinariaRepository.findOne({
        where: { patente: maquinariaData.patente },
      })

      if (maquinariaExistente) {
        throw new Error(`Ya existe una maquinaria con la patente ${maquinariaData.patente}`)
      }
    }

    this.maquinariaRepository.merge(maquinaria, maquinariaData)
    return this.maquinariaRepository.save(maquinaria)
  }

  async remove(id: number): Promise<void> {
    const maquinaria = await this.findOne(id)
    await this.maquinariaRepository.remove(maquinaria)
  }

  async buscarPorMarca(marca: string): Promise<Maquinaria[]> {
    return this.maquinariaRepository.find({
      where: {
        marca: {
          $like: `%${marca}%`,
        } as any,
      },
    })
  }

  async buscarPorGrupo(grupo: string): Promise<Maquinaria[]> {
    // Verificar si el valor es válido en el enum
    if (!Object.values(GrupoMaquinaria).includes(grupo as GrupoMaquinaria)) {
      throw new Error(
        `Grupo inválido: ${grupo}. Los valores permitidos son: ${Object.values(GrupoMaquinaria).join(", ")}`,
      )
    }

    return this.maquinariaRepository.find({
      where: { grupo: grupo as GrupoMaquinaria },
    })
  }
}
