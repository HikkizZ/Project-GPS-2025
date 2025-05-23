import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  OneToOne,
  OneToMany
} from "typeorm";
import { FichaEmpresa } from "./fichaEmpresa.entity.js";
import { HistorialLaboral } from "./historialLaboral.entity.js";
import { LicenciaPermiso } from "./licenciaPermiso.entity.js";
import { Capacitacion } from "./capacitacion.entity.js";

@Entity("trabajadores")
export class Trabajador {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index("IDX_TRABAJADORES_RUT", { unique: true })
  @Column({ type: "varchar", length: 12, nullable: false })
  rut!: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  nombres!: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  apellidoPaterno!: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  apellidoMaterno!: string;

  @Column({ type: "date", nullable: true })
  fechaNacimiento!: Date;

  @Column({ type: "varchar", length: 12, nullable: false })
  telefono!: string;

  @Index("IDX_TRABAJADORES_EMAIL", { unique: true })
  @Column({ type: "varchar", length: 255, nullable: false })
  correo!: string;

  @Column({ type: "varchar", length: 12, nullable: true })
  numeroEmergencia!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  direccion!: string;

  @Column({ type: "date", nullable: false })
  fechaIngreso!: Date;

  @Column({ type: "boolean", default: true })
  enSistema!: boolean;

  // Relación 1:1 con ficha empresa
  @OneToOne(() => FichaEmpresa, ficha => ficha.trabajador)
  fichaEmpresa!: FichaEmpresa;

  // Relación 1:N con historial laboral
  @OneToMany(() => HistorialLaboral, historial => historial.trabajador)
  historialLaboral!: HistorialLaboral[];

  // Relación 1:N con licencias/permiso
  @OneToMany(() => LicenciaPermiso, licencia => licenciaPermiso.trabajador)
  licenciaspermisos!: LicenciaPermiso[];

  // Relación 1:N con capacitaciones
  @OneToMany(() => Capacitacion, capacitacion => capacitacion.trabajador)
  capacitaciones!: Capacitacion[];
}