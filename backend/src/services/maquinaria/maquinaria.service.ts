import type { Repository } from "typeorm"
import { Maquinaria, EstadoMaquinaria } from "../../entity/maquinaria/maquinaria.entity.js"
import { AppDataSource } from "../../config/configDB.js"
import {
  MaintenanceRecord,
  EstadoMantencion,
  type RazonMantencion,
} from "../../entity/MachineryMaintenance/maintenanceRecord.entity.js"
import { User } from "../../entity/user.entity.js"
import { FileUploadService } from "../../services/fileUpload.service.js"
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
      isActive: true,
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

    // Procesar nuevo archivo PDF si existe
    if (file) {
      // Eliminar archivo anterior si existe (NO eliminar para mantener trazabilidad)
      // if (maquinaria.padronUrl) {
      //   const oldFilename = path.basename(maquinaria.padronUrl)
      //   FileUploadService.deleteFile(FileUploadService.getPadronPath(oldFilename))
      // }

      // El archivo ya fue procesado por Multer y está en la carpeta correcta
      maquinariaData.padronUrl = file.filename
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
        isActive: true,
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

  async softRemove(id: number): Promise<void> {
    const maquinaria = await this.findOne(id)
    await this.maquinariaRepository.update(id, { isActive: false })
  }

  async restore(id: number): Promise<Maquinaria> {
    const maquinaria = await this.findOne(id, true)
    if (maquinaria.isActive) {
      throw new Error("La maquinaria ya está activa")
    }

    await this.maquinariaRepository.update(id, { isActive: true })
    return this.findOne(id)
  }

  async actualizarPadron(id: number, file: Express.Multer.File): Promise<Maquinaria> {
    const maquinaria = await this.findOne(id)
    maquinaria.padronUrl = file.filename

    return this.maquinariaRepository.save(maquinaria)
  }

  async eliminarPadron(id: number): Promise<Maquinaria> {
    const maquinaria = await this.findOne(id)
    maquinaria.padronUrl = undefined
    return this.maquinariaRepository.save(maquinaria)
  }

  // Nueva función para descargar padrón
  async descargarPadron(id: number): Promise<{ filePath: string; customFilename: string }> {
    const maquinaria = await this.findOne(id)

    if (!maquinaria.padronUrl) {
      throw new Error("No hay padrón disponible para descargar")
    }

    // Obtener la ruta del archivo usando el FileUploadService
    const filePath = FileUploadService.getPadronPath(maquinaria.padronUrl)

    // Verificar que el archivo existe
    if (!FileUploadService.fileExists(filePath)) {
      throw new Error("El archivo del padrón no se encuentra en el servidor")
    }

    // Generar nombre personalizado
    const customFilename = `Padron_${maquinaria.patente}_${maquinaria.marca}_${maquinaria.modelo}.pdf`.replace(
      /[^a-zA-Z0-9.-]/g,
      "_",
    )

    return { filePath, customFilename }
  }
}
