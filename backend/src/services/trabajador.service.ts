import { AppDataSource } from "../config/configDB.js";
import { Trabajador } from "../entity/trabajador.js";
import { Repository } from "typeorm";

export class TrabajadorService {
  private trabajadorRepo: Repository<Trabajador>;

  constructor() {
    this.trabajadorRepo = AppDataSource.getRepository(Trabajador);
  }

  // Crear nuevo trabajador
  async crear(data: Partial<Trabajador>): Promise<Trabajador> {
    const nuevo = this.trabajadorRepo.create(data);
    return await this.trabajadorRepo.save(nuevo);
  }

  // Obtener solo los trabajadores activos
  async obtenerTodos(): Promise<Trabajador[]> {
    return await this.trabajadorRepo.find({
      where: { activo: true }
    });
  }

  // Obtener trabajador por ID (solo si está activo)
  async obtenerPorId(id: number): Promise<Trabajador | null> {
    return await this.trabajadorRepo.findOne({
      where: { id, activo: true }
    });
  }

  // Actualizar datos de un trabajador
  async actualizar(id: number, data: Partial<Trabajador>): Promise<Trabajador | null> {
    const trabajador = await this.trabajadorRepo.findOneBy({ id });
    if (!trabajador || !trabajador.activo) return null;

    this.trabajadorRepo.merge(trabajador, data);
    return await this.trabajadorRepo.save(trabajador);
  }

  // Eliminación lógica: marcar como inactivo
  async eliminar(id: number): Promise<boolean> {
    const trabajador = await this.trabajadorRepo.findOneBy({ id });
    if (!trabajador || !trabajador.activo) return false;

    trabajador.activo = false;
    await this.trabajadorRepo.save(trabajador);
    return true;
  }

  //Obtener todos, incluyendo los eliminados
  async obtenerTodosIncluyendoInactivos(): Promise<Trabajador[]> {
    return await this.trabajadorRepo.find();
  }

  // Obtener solo los trabajadores inactivos (eliminados lógicamente)
  async obtenerEliminados(): Promise<Trabajador[]> {
    return await this.trabajadorRepo.find({
        where: { activo: false }
    });
  }

  // Restaurar trabajador (marcar como activo)
  async restaurar(id: number): Promise<boolean> {
    const trabajador = await this.trabajadorRepo.findOneBy({ id });
    if (!trabajador || trabajador.activo) return false;

    trabajador.activo = true;
    await this.trabajadorRepo.save(trabajador);
    return true;
  }
}