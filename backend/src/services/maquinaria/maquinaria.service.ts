import type { Repository } from "typeorm"
import { Maquinaria, EstadoMaquinaria } from "../../entity/maquinaria/maquinaria.entity.js"
import { AppDataSource } from "../../config/configDB.js"
import { MaintenanceRecord, EstadoMantencion, RazonMantencion } from "../../entity/MachineryMaintenance/maintenanceRecord.entity.js"
import { User } from "../../entity/user.entity.js"
export class MaquinariaService {
  private maquinariaRepository: Repository<Maquinaria>

  constructor() {
    this.maquinariaRepository = AppDataSource.getRepository(Maquinaria)
  }

  async create(maquinariaData: Partial<Maquinaria>): Promise<Maquinaria> {
    const nuevaMaquinaria = this.maquinariaRepository.create({
      ...maquinariaData,
      estado: maquinariaData.estado || EstadoMaquinaria.DISPONIBLE,
    })

    return this.maquinariaRepository.save(nuevaMaquinaria)
  }

  async findAll(): Promise<Maquinaria[]> {
    return this.maquinariaRepository.find({
      relations: ["compras", "ventas"],
    })
  }

  async findOne(id: number): Promise<Maquinaria> {
    const maquinaria = await this.maquinariaRepository.findOne({
      where: { id },
      relations: ["compras", "ventas"],
    })

    if (!maquinaria) {
      throw new Error(`Maquinaria con ID ${id} no encontrada`)
    }

    return maquinaria
  }

  async findByPatente(patente: string): Promise<Maquinaria> {
    const maquinaria = await this.maquinariaRepository.findOne({
      where: { patente },
      relations: ["compras", "ventas"],
    })

    if (!maquinaria) {
      throw new Error(`Maquinaria con patente ${patente} no encontrada`)
    }

    return maquinaria
  }

  async update(id: number, maquinariaData: Partial<Maquinaria>): Promise<Maquinaria> {
    const maquinaria = await this.findOne(id)
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
      },
      relations: ["compras", "ventas"],
    })
  }

  async obtenerMaquinariaPorGrupo(grupo: string): Promise<Maquinaria[]> {
    return this.maquinariaRepository.find({
      where: { grupo: grupo as any },
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
    mecanicoId: number;
    razonMantencion: RazonMantencion;
    descripcionEntrada: string;
  }
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

}
