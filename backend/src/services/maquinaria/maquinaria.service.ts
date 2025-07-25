import type { Repository } from "typeorm"
import { Maquinaria, EstadoMaquinaria } from "../../entity/maquinaria/maquinaria.entity.js"
import { AppDataSource } from "../../config/configDB.js"
import {
  MaintenanceRecord,
  EstadoMantencion,
  type RazonMantencion,
} from "../../entity/MachineryMaintenance/maintenanceRecord.entity.js"
import { User } from "../../entity/user.entity.js"
import { MaquinariaFileUploadService } from "./maquinariaFileUpload.service.js"
import type { Express } from "express"

export class MaquinariaService {
  private maquinariaRepository: Repository<Maquinaria>

  constructor() {
    this.maquinariaRepository = AppDataSource.getRepository(Maquinaria)
  }

  async create(maquinariaData: Partial<Maquinaria>): Promise<Maquinaria> {
    const nuevaMaquinaria = this.maquinariaRepository.create({
      ...maquinariaData,
      estado: maquinariaData.estado || EstadoMaquinaria.DISPONIBLE,
      isActive: true, // Siempre activa al crear
    })

    return this.maquinariaRepository.save(nuevaMaquinaria)
  }

  async findAll(incluirInactivas = false): Promise<Maquinaria[]> {
    const whereCondition = incluirInactivas ? {} : { isActive: true }

    return this.maquinariaRepository.find({
      where: whereCondition,
      relations: ["compras", "ventas"],
    })
  }

  async findOne(id: number, incluirInactivas = false): Promise<Maquinaria> {
    const whereCondition = incluirInactivas ? { id } : { id, isActive: true }

    const maquinaria = await this.maquinariaRepository.findOne({
      where: whereCondition,
      relations: ["compras", "ventas"],
    })

    if (!maquinaria) {
      throw new Error(`Maquinaria con ID ${id} no encontrada`)
    }

    return maquinaria
  }

  async findByPatente(patente: string, incluirInactivas = false): Promise<Maquinaria> {
    const whereCondition = incluirInactivas ? { patente } : { patente, isActive: true }

    const maquinaria = await this.maquinariaRepository.findOne({
      where: whereCondition,
      relations: ["compras", "ventas"],
    })

    if (!maquinaria) {
      throw new Error(`Maquinaria con patente ${patente} no encontrada`)
    }

    return maquinaria
  }

  async update(id: number, maquinariaData: Partial<Maquinaria>, file?: Express.Multer.File): Promise<Maquinaria> {
    const maquinaria = await this.findOne(id)

    // Procesar nuevo archivo si existe
    if (file) {
      // Eliminar archivo anterior si existe
      if (maquinaria.padronUrl) {
        const oldFilename = maquinaria.padronUrl.split("/").pop()
        if (oldFilename) {
          try {
            await MaquinariaFileUploadService.deleteFile(oldFilename)
          } catch (error) {
            console.warn("No se pudo eliminar el archivo anterior:", error)
          }
        }
      }

      // Subir nuevo archivo
      const uploadResult = await MaquinariaFileUploadService.uploadFile(file)
      maquinariaData.padronUrl = uploadResult.url
    }

    this.maquinariaRepository.merge(maquinaria, maquinariaData)
    return this.maquinariaRepository.save(maquinaria)
  }

  async remove(id: number): Promise<void> {
    const maquinaria = await this.findOne(id)
    await this.maquinariaRepository.remove(maquinaria)
  }

  async obtenerMaquinariaDisponible(): Promise<Maquinaria[]> {
    return this.maquinariaRepository.find({
      where: {
        estado: EstadoMaquinaria.DISPONIBLE,
        isActive: true, // Solo maquinarias activas
      },
      relations: ["compras", "ventas"],
    })
  }

  async obtenerMaquinariaPorGrupo(grupo: string, incluirInactivas = false): Promise<Maquinaria[]> {
    const whereCondition = incluirInactivas ? { grupo: grupo as any } : { grupo: grupo as any, isActive: true }

    return this.maquinariaRepository.find({
      where: whereCondition,
      relations: ["compras", "ventas"],
    })
  }

  async actualizarKilometraje(id: number, nuevoKilometraje: number): Promise<Maquinaria> {
    const maquinaria = await this.findOne(id)

    if (nuevoKilometraje < maquinaria.kilometrajeActual) {
      throw new Error("El nuevo kilometraje no puede ser menor al actual")
    }

    maquinaria.kilometrajeActual = nuevoKilometraje
    return this.maquinariaRepository.save(maquinaria)
  }

  async cambiarEstado(
    id: number,
    nuevoEstado: EstadoMaquinaria,
    opcionesMantencion?: {
      mecanicoId: number
      razonMantencion: RazonMantencion
      descripcionEntrada: string
    },
  ): Promise<Maquinaria> {
    const maquinaria = await this.findOne(id)
    maquinaria.estado = nuevoEstado
    await this.maquinariaRepository.save(maquinaria)

    if (nuevoEstado === EstadoMaquinaria.MANTENIMIENTO) {
      const recordRepo = AppDataSource.getRepository(MaintenanceRecord)
      const userRepo = AppDataSource.getRepository(User)

      const existeMantencion = await recordRepo.findOne({
        where: {
          maquinaria: { id: maquinaria.id },
          estado: EstadoMantencion.PENDIENTE,
        },
      })
      if (existeMantencion) {
        console.warn("Ya existe una mantención pendiente para esta maquinaria")
        return maquinaria
      }

      if (!opcionesMantencion) {
        throw new Error("Se requieren los datos de mantención para cambiar a estado 'mantenimiento'")
      }

      const { mecanicoId, razonMantencion, descripcionEntrada } = opcionesMantencion
      const mecanico = await userRepo.findOneBy({ id: mecanicoId })

      if (!mecanico || mecanico.role !== "Mecánico") {
        throw new Error("El usuario no es un mecánico válido")
      }

      const nuevaMantencion = recordRepo.create({
        maquinaria,
        razonMantencion,
        descripcionEntrada,
        estado: EstadoMantencion.PENDIENTE,
        fechaEntrada: new Date(),
        mecanicoAsignado: mecanico,
      })

      await recordRepo.save(nuevaMantencion)
    }

    return maquinaria
  }

  // Nuevos métodos para soft delete
  async softRemove(id: number): Promise<void> {
    const maquinaria = await this.findOne(id)
    await this.maquinariaRepository.update(id, { isActive: false })
  }

  async restore(id: number): Promise<Maquinaria> {
    const maquinaria = await this.findOne(id, true) // Incluir inactivas
    if (maquinaria.isActive) {
      throw new Error("La maquinaria ya está activa")
    }

    await this.maquinariaRepository.update(id, { isActive: true })
    return this.findOne(id)
  }

  // Nuevo método para actualizar archivo del padrón
  async actualizarPadron(id: number, file: Express.Multer.File): Promise<Maquinaria> {
    const maquinaria = await this.findOne(id)

    // Eliminar archivo anterior si existe
    if (maquinaria.padronUrl) {
      const oldFilename = maquinaria.padronUrl.split("/").pop()
      if (oldFilename) {
        try {
          await MaquinariaFileUploadService.deleteFile(oldFilename)
        } catch (error) {
          console.warn("No se pudo eliminar el archivo anterior:", error)
        }
      }
    }

    // Subir nuevo archivo
    const uploadResult = await MaquinariaFileUploadService.uploadFile(file)
    maquinaria.padronUrl = uploadResult.url

    return this.maquinariaRepository.save(maquinaria)
  }

  // Método para eliminar archivo del padrón
  async eliminarPadron(id: number): Promise<Maquinaria> {
    const maquinaria = await this.findOne(id)

    if (maquinaria.padronUrl) {
      const filename = maquinaria.padronUrl.split("/").pop()
      if (filename) {
        try {
          await MaquinariaFileUploadService.deleteFile(filename)
        } catch (error) {
          console.warn("No se pudo eliminar el archivo:", error)
        }
      }
    }

    maquinaria.padronUrl = undefined
    return this.maquinariaRepository.save(maquinaria)
  }
}
