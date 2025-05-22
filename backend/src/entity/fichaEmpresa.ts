import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn
} from "typeorm";
import { Trabajador } from "./trabajador.js";

export enum EstadoLaboral {
  ACTIVO = "Activo",
  LICENCIA = "Licencia",
  PERMISO = "Permiso administrativo",
  DESVINCULADO = "Desvinculado"
}

@Entity("fichas_empresa")
export class FichaEmpresa {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => Trabajador)
  @JoinColumn()
  trabajador!: Trabajador;

  @Column({ type: "varchar", length: 100, nullable: false })
  cargo!: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  area!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  empresa!: string;

  @Column({ type: "varchar", length: 50, nullable: false })
  tipoContrato!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  jornadaLaboral!: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  sueldoBase!: number;

  @Column({ type: "date", nullable: false })
  fechaInicioContrato!: Date;

  @Column({ type: "date", nullable: true })
  fechaFinContrato!: Date;

  @Column({
    type: "enum",
    enum: EstadoLaboral,
    default: EstadoLaboral.ACTIVO
  })
  estado!: EstadoLaboral;
}