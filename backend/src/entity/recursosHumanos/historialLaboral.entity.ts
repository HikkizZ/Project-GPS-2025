import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn
} from "typeorm";
import { Trabajador } from "./trabajador.entity.js";
import { User } from "../user.entity.js";

@Entity("historial_laboral")
export class HistorialLaboral {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Trabajador, trabajador => trabajador.historialLaboral, { nullable: false })
  @JoinColumn({ name: "trabajadorId" })
  trabajador!: Trabajador;

  @Column({ type: "varchar", length: 100, nullable: false })
  cargo!: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  area!: string;

  @Column({ type: "varchar", length: 50, nullable: false })
  tipoContrato!: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  sueldoBase!: number;

  @Column({ type: "date", nullable: false })
  fechaInicio!: Date;

  @Column({ type: "date", nullable: true })
  fechaFin!: Date;

  @Column({ type: "text", nullable: true })
  motivoTermino!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  contratoURL!: string;

  @CreateDateColumn({ type: "timestamp" })
  fechaRegistro!: Date;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "registradoPorId" })
  registradoPor!: User;
} 