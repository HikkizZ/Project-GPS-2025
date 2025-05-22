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

  // Obtener todos los trabajadores que están en el sistema (no eliminados)
  async obtenerTodos(): Promise<Trabajador[]> {
    return await this.trabajadorRepo.find({
      where: { enSistema: true }
    });
  }

  // Obtener un trabajador por su ID (si está en el sistema)
  async obtenerPorId(id: number): Promise<Trabajador | null> {
    return await this.trabajadorRepo.findOne({
      where: { id, enSistema: true }
    });
  }

  // Actualizar datos de un trabajador (solo si está en el sistema)
  async actualizar(id: number, data: Partial<Trabajador>): Promise<Trabajador | null> {
    const trabajador = await this.trabajadorRepo.findOneBy({ id });
    if (!trabajador || !trabajador.enSistema) return null;

    this.trabajadorRepo.merge(trabajador, data);
    return await this.trabajadorRepo.save(trabajador);
  }

  // Eliminación lógica: marcar al trabajador como fuera del sistema
  async eliminar(id: number): Promise<boolean> {
    const trabajador = await this.trabajadorRepo.findOneBy({ id });
    if (!trabajador || !trabajador.enSistema) return false;

    trabajador.enSistema = false;
    await this.trabajadorRepo.save(trabajador);
    return true;
  }

  // Obtener todos los trabajadores, incluyendo los eliminados lógicamente
  async obtenerTodosIncluyendoEliminados(): Promise<Trabajador[]> {
    return await this.trabajadorRepo.find();
  }

  // Obtener solo trabajadores eliminados lógicamente
  async obtenerEliminados(): Promise<Trabajador[]> {
    return await this.trabajadorRepo.find({
      where: { enSistema: false }
    });
  }

  // Restaurar un trabajador eliminado (volver a marcarlo como en sistema)
  async restaurar(id: number): Promise<boolean> {
    const trabajador = await this.trabajadorRepo.findOneBy({ id });
    if (!trabajador || trabajador.enSistema) return false;

    trabajador.enSistema = true;
    await this.trabajadorRepo.save(trabajador);
    return true;
  }
}