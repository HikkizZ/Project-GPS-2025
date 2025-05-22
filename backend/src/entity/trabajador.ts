import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

export enum EstadoTrabajador {
  ACTIVO = "Activo",
  LICENCIA = "Licencia",
  DESVINCULADO = "Desvinculado"
}

@Entity("trabajadores")
export class Trabajador {
  // Identificación
  @PrimaryGeneratedColumn()
  id!: number;

  @Index("IDX_TRABAJADORES_RUT", { unique: true })
  @Column({ type: "varchar", length: 12, nullable: false })
  rut!: string;

  // Nombres y Apellidos
  @Column({ type: "varchar", length: 100, nullable: false })
  nombres!: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  apellidoPaterno!: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  apellidoMaterno!: string;

  // Datos personales
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

  // Información laboral
  @Column({ type: "varchar", length: 100, nullable: false })
  cargo!: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  area!: string;

  // Contrato
  @Column({ type: "date", nullable: false })
  fechaInicioContrato!: Date;

  @Column({ type: "date", nullable: true })
  fechaFinContrato!: Date;

  @Column({ type: "varchar", length: 50, nullable: false })
  tipoContrato!: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  sueldoBase!: number;

  // Estado y control
  @Column({ type: "enum", enum: EstadoTrabajador, default: EstadoTrabajador.ACTIVO })
  estado!: EstadoTrabajador;

  @Column({ type: "boolean", default: true })
  enSistema!: boolean;

}