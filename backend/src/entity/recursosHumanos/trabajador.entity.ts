import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  OneToOne,
  OneToMany,
  CreateDateColumn
} from "typeorm";
import { HistorialLaboral } from "./historialLaboral.entity.js";
import { LicenciaPermiso } from "./licenciaPermiso.entity.js";
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
        // Si ya es un string en formato YYYY-MM-DD, mantenerlo así
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
          return value;
        }
        // Si es una fecha, convertirla a YYYY-MM-DD
        const date = typeof value === 'string' ? new Date(value) : value;
        return date.toISOString().split('T')[0];
      },
      from: (value: string | Date | null): Date | null => {
        if (!value) return null;
        // Mantener la fecha exacta sin ajustes de zona horaria
        if (typeof value === 'string') {
          const [year, month, day] = value.split('-').map(Number);
          return new Date(year, month - 1, day);
        }
        return value;
      }
    }
  })
  fechaNacimiento!: Date;

  @Column({ type: "varchar", length: 12, nullable: false })
  telefono!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  correoPersonal!: string;

  @Column({ type: "varchar", length: 12, nullable: true })
  numeroEmergencia!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  direccion!: string;

  @Column({ 
    type: "date",
    transformer: {
      to: (value: Date | string | null): string | null => {
        if (!value) return null;
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
          return value;
        }
        const date = typeof value === 'string' ? new Date(value) : value;
        return date.toISOString().split('T')[0];
      },
      from: (value: string | Date | null): Date | null => {
        if (!value) return null;
        if (typeof value === 'string') {
          const [year, month, day] = value.split('-').map(Number);
          return new Date(year, month - 1, day);
        }
        return value;
      }
    }
  })
  fechaIngreso!: Date;

  @Column({ type: "boolean", default: true })
  enSistema!: boolean;

  // Relación 1:1 con ficha empresa
  @OneToOne('FichaEmpresa', 'trabajador')
  fichaEmpresa!: any;

  // Relación 1:N con historial laboral
  @OneToMany(() => HistorialLaboral, historial => historial.trabajador)
  historialLaboral!: HistorialLaboral[];

  // Relación 1:N con licencias/permiso
  @OneToMany(() => LicenciaPermiso, licenciaPermiso => licenciaPermiso.trabajador)
  licenciasPermisos!: LicenciaPermiso[];

  // Relación 1:1 con usuario
  @OneToOne(() => User, user => user.trabajador)
  usuario!: User;

  @CreateDateColumn({ type: "timestamp" })
  fechaRegistro!: Date;
}