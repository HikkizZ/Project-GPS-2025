import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany
} from "typeorm";

import { AsignarBono } from "./Remuneraciones/asignarBono.entity.js";

export enum EstadoLaboral {
  ACTIVO = "Activo",
  LICENCIA = "Licencia médica",
  PERMISO = "Permiso administrativo",
  DESVINCULADO = "Desvinculado"
}

export enum companiaFondoAFP {
    habitat = "habitat",
    provida = "provida",
    modelo = "modelo",
    cuprum = "cuprum",
    capital = "capital",
    planvital = "planvital",
    uno = "uno"
}

export enum TipoPrevisionSalud {
    ISAPRE = "ISAPRE",
    FONASA = "FONASA"
}

@Entity("fichas_empresa")
export class FichaEmpresa {
  @PrimaryGeneratedColumn()
  id!: number;

  // Relación con Trabajador
  @OneToOne("Trabajador", "fichaEmpresa")
  @JoinColumn()
  trabajador!: any;

  @OneToMany("AsignarBono", "fichaEmpresa")
  asignacionesBonos!: AsignarBono[];

  @Column({ type: "varchar", length: 100, nullable: false })
  cargo!: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  area!: string;

  @Column({ type: "varchar", length: 50, nullable: false })
  tipoContrato!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  jornadaLaboral!: string;

  @Column({ 
    type: "integer", 
    nullable: true,
    transformer: {
      to: (value: number | null): number => {
        return value === null ? 0 : Math.round(value);
      },
      from: (value: string | number | null): number => {
        if (value === null) return 0;
        return typeof value === 'string' ? parseInt(value) : value;
      }
    },
    default: 0
  })
  sueldoBase!: number;
  
  @Column({ type: "enum", enum: TipoPrevisionSalud, nullable: true })
  previsionSalud!: TipoPrevisionSalud;

  @Column({ type: "enum", enum: companiaFondoAFP, nullable: true })
  afp!: companiaFondoAFP;

  @Column({ type: "boolean", nullable: true })
  seguroCesantia!: boolean;

  @Column({
    type: "date",
    nullable: false,
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
  fechaInicioContrato!: Date;

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
  fechaFinContrato?: Date;

  @Column({
    type: "enum",
    enum: EstadoLaboral,
    default: EstadoLaboral.ACTIVO
  })
  estado!: EstadoLaboral;

  @Column({ type: "text", nullable: true })
  motivoDesvinculacion!: string | null;

  @Column({
    type: "date",
    nullable: true,
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
  fechaInicioLicencia?: Date | null;

  @Column({
    type: "date",
    nullable: true,
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
  fechaFinLicencia?: Date | null;

  @Column({ type: "text", nullable: true })
  motivoLicencia?: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  contratoURL!: string | null;
}
