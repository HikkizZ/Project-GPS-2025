import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

export enum EstadoTrabajador {
  ACTIVO = "Activo",
  LICENCIA = "Licencia",
  DESVINCULADO = "Desvinculado"
}

@Entity("trabajadores")
export class Trabajador {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  nombre!: string;

  @Index("IDX_TRABAJADORES_RUT", { unique: true })
  @Column({ type: "varchar", length: 12, nullable: false })
  rut!: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  cargo!: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  area!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  direccion!: string;

  @Column({ type: "varchar", length: 12, nullable: false })
  telefono!: string;

  @Index("IDX_TRABAJADORES_EMAIL", { unique: true })
  @Column({ type: "varchar", length: 255, nullable: false })
  correo!: string;

  @Column({ type: "date", nullable: false })
  fechaIngreso!: Date;

  @Column({ type: "varchar", length: 50, nullable: false })
  tipoContrato!: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  sueldoBase!: number;

  @Column({ type: "enum", enum: EstadoTrabajador, default: EstadoTrabajador.ACTIVO })
  estado!: EstadoTrabajador;
}