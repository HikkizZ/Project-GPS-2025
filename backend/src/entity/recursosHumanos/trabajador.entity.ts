import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  OneToOne,
  OneToMany,
  CreateDateColumn
} from "typeorm";
import { FichaEmpresa } from "./fichaEmpresa.entity.js";
import { HistorialLaboral } from "./historialLaboral.entity.js";
import { LicenciaPermiso } from "./licenciaPermiso.entity.js";
import { Capacitacion } from "./capacitacion.entity.js";
import { User } from "../user.entity.js";

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

  @Column({ 
    type: "date", 
    nullable: true,
    transformer: {
      to: (value: Date | string | null): string | null => {
        if (!value) return null;
        const date = typeof value === 'string' ? new Date(value) : value;
        return date.toISOString().split('T')[0];
      },
      from: (value: string | Date | null): Date | null => {
        if (!value) return null;
        return new Date(value);
      }
    }
  })
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

  @CreateDateColumn({ type: "date" })
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
  @OneToMany(() => LicenciaPermiso, licenciaPermiso => licenciaPermiso.trabajador)
  licenciasPermisos!: LicenciaPermiso[];

  // Relación 1:N con capacitaciones
  @OneToMany(() => Capacitacion, capacitacion => capacitacion.trabajador)
  capacitaciones!: Capacitacion[];

  // Relación 1:1 con usuario
  @OneToOne(() => User, user => user.trabajador)
  usuario!: User;

  @CreateDateColumn({ type: "timestamp" })
  fechaRegistro!: Date;
}