import type { Repository } from "typeorm"
import { ArriendoMaquinaria } from "../../entity/maquinaria/arriendoMaquinaria.entity.js"
import { Maquinaria, EstadoMaquinaria } from "../../entity/maquinaria/maquinaria.entity.js"
import { Customer } from "../../entity/stakeholders/customer.entity.js"
import { User } from "../../entity/user.entity.js"
import { AppDataSource } from "../../config/configDB.js"

export class ArriendoMaquinariaService {
  private arriendoRepository: Repository<ArriendoMaquinaria>
  private maquinariaRepository: Repository<Maquinaria>
  private customerRepository: Repository<Customer>
  private userRepository: Repository<User>

  constructor() {
    this.arriendoRepository = AppDataSource.getRepository(ArriendoMaquinaria)
    this.maquinariaRepository = AppDataSource.getRepository(Maquinaria)
    this.customerRepository = AppDataSource.getRepository(Customer)
    this.userRepository = AppDataSource.getRepository(User)
  }

  async crearArriendo(arriendoData: Partial<ArriendoMaquinaria>): Promise<ArriendoMaquinaria> {
    // Validar que la maquinaria existe y está disponible
    const maquinaria = await this.maquinariaRepository.findOne({
      where: { id: arriendoData.maquinariaId },
    })

    if (!maquinaria) {
      throw new Error("Maquinaria no encontrada")
    }

    if (maquinaria.estado !== EstadoMaquinaria.DISPONIBLE) {
      throw new Error("La maquinaria no está disponible para arriendo")
    }

    // Validar que el cliente existe
    const cliente = await this.customerRepository.findOne({
      where: { id: arriendoData.clienteId },
    })

    if (!cliente) {
      throw new Error("Cliente no encontrado")
    }

    // Validar que el conductor existe y tiene el rol correcto
    const conductor = await this.userRepository.findOne({
      where: { id: arriendoData.conductorId },
    })

    if (!conductor) {
      throw new Error("Conductor no encontrado")
    }

    // SOLUCIÓN MÍNIMA: Usar type assertion
    if ((conductor.role as string) !== "Conductor") {
      throw new Error("El usuario seleccionado no tiene el rol de Conductor")
    }

    // Verificar que no exista otro arriendo para la misma maquinaria en la misma fecha
    const arriendoExistente = await this.arriendoRepository.findOne({
      where: {
        maquinariaId: arriendoData.maquinariaId,
        fecha: arriendoData.fecha,
      },
    })

    if (arriendoExistente) {
      throw new Error("Ya existe un arriendo para esta maquinaria en la fecha seleccionada")
    }

    // Crear el arriendo con datos desnormalizados
    const nuevoArriendo = this.arriendoRepository.create({
      ...arriendoData,
      // Datos de maquinaria
      patente: maquinaria.patente,
      marca: maquinaria.marca,
      modelo: maquinaria.modelo,
      // Datos de cliente
      rutCliente: cliente.rut,
      nombreCliente: cliente.name,
      // Datos de conductor
      rutConductor: conductor.rut!,
      nombreConductor: conductor.name,
      // Kilometraje inicial
      kilometrajeInicial: arriendoData.kilometrajeInicial || maquinaria.kilometrajeActual,
    })

    return this.arriendoRepository.save(nuevoArriendo)
  }

  async obtenerTodosLosArriendos(): Promise<ArriendoMaquinaria[]> {
    return this.arriendoRepository.find({
      relations: ["maquinaria", "cliente", "conductor"],
      order: { fecha: "DESC" },
    })
  }

  async obtenerArriendoPorId(id: number): Promise<ArriendoMaquinaria> {
    const arriendo = await this.arriendoRepository.findOne({
      where: { id },
      relations: ["maquinaria", "cliente", "conductor"],
    })

    if (!arriendo) {
      throw new Error(`Arriendo con ID ${id} no encontrado`)
    }

    return arriendo
  }

  async obtenerArriendosPorFecha(fecha: Date): Promise<ArriendoMaquinaria[]> {
    return this.arriendoRepository.find({
      where: { fecha },
      relations: ["maquinaria", "cliente", "conductor"],
      order: { createdAt: "DESC" },
    })
  }

  async obtenerArriendosPorCliente(clienteId: number): Promise<ArriendoMaquinaria[]> {
    return this.arriendoRepository.find({
      where: { clienteId },
      relations: ["maquinaria", "cliente", "conductor"],
      order: { fecha: "DESC" },
    })
  }

  async obtenerArriendosPorConductor(conductorId: number): Promise<ArriendoMaquinaria[]> {
    return this.arriendoRepository.find({
      where: { conductorId },
      relations: ["maquinaria", "cliente", "conductor"],
      order: { fecha: "DESC" },
    })
  }

  async obtenerArriendosPorMaquinaria(maquinariaId: number): Promise<ArriendoMaquinaria[]> {
    return this.arriendoRepository.find({
      where: { maquinariaId },
      relations: ["maquinaria", "cliente", "conductor"],
      order: { fecha: "DESC" },
    })
  }

  async obtenerArriendosPorObra(obra: string): Promise<ArriendoMaquinaria[]> {
    return this.arriendoRepository.find({
      where: { obra },
      relations: ["maquinaria", "cliente", "conductor"],
      order: { fecha: "DESC" },
    })
  }

  async finalizarArriendo(id: number, kilometrajeFinal: number): Promise<ArriendoMaquinaria> {
    const arriendo = await this.obtenerArriendoPorId(id)

    if (arriendo.kilometrajeFinal) {
      throw new Error("Este arriendo ya ha sido finalizado")
    }

    if (kilometrajeFinal < arriendo.kilometrajeInicial) {
      throw new Error("El kilometraje final no puede ser menor al inicial")
    }

    // Actualizar el arriendo
    arriendo.kilometrajeFinal = kilometrajeFinal

    // Actualizar kilometraje de la maquinaria
    await this.maquinariaRepository.update(arriendo.maquinariaId, {
      kilometrajeActual: kilometrajeFinal,
    })

    return this.arriendoRepository.save(arriendo)
  }

  async actualizarArriendo(id: number, datosActualizacion: Partial<ArriendoMaquinaria>): Promise<ArriendoMaquinaria> {
    const arriendo = await this.obtenerArriendoPorId(id)

    // No permitir actualizar ciertos campos críticos
    const {
      maquinariaId,
      clienteId,
      conductorId,
      patente,
      marca,
      modelo,
      rutCliente,
      nombreCliente,
      rutConductor,
      nombreConductor,
      ...datosPermitidos
    } = datosActualizacion

    this.arriendoRepository.merge(arriendo, datosPermitidos)
    return this.arriendoRepository.save(arriendo)
  }

  async obtenerArriendosPorRangoFecha(fechaInicio: Date, fechaFin: Date): Promise<ArriendoMaquinaria[]> {
    return this.arriendoRepository
      .createQueryBuilder("arriendo")
      .leftJoinAndSelect("arriendo.maquinaria", "maquinaria")
      .leftJoinAndSelect("arriendo.cliente", "cliente")
      .leftJoinAndSelect("arriendo.conductor", "conductor")
      .where("arriendo.fecha >= :fechaInicio", { fechaInicio })
      .andWhere("arriendo.fecha <= :fechaFin", { fechaFin })
      .orderBy("arriendo.fecha", "DESC")
      .getMany()
  }

  async obtenerIngresosPorPeriodo(fechaInicio: Date, fechaFin: Date): Promise<number> {
    const resultado = await this.arriendoRepository
      .createQueryBuilder("arriendo")
      .select("SUM(arriendo.montoTotal)", "total")
      .where("arriendo.fecha >= :fechaInicio", { fechaInicio })
      .andWhere("arriendo.fecha <= :fechaFin", { fechaFin })
      .getRawOne()

    return Number(resultado.total) || 0
  }

  async eliminarArriendo(id: number): Promise<void> {
    const arriendo = await this.obtenerArriendoPorId(id)
    await this.arriendoRepository.remove(arriendo)
  }
}
