import { Entity, PrimaryGeneratedColumn, Column, Index, OneToOne } from "typeorm";

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

  // Eliminación lógica
  @Column({ type: "boolean", default: true })
  enSistema!: boolean;
}
