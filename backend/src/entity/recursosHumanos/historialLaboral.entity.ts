import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  UpdateDateColumn
} from "typeorm";

@Entity("historial_laboral")
export class HistorialLaboral {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100, nullable: false })
  cargo!: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  area!: string;

  @Column({ type: "varchar", length: 50, nullable: false })
  tipoContrato!: string;

  @Column({ type: "varchar", length: 50, nullable: false })
  jornadaLaboral!: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  sueldoBase!: number;

  @Column({ type: "date", nullable: false })
  fechaInicio!: Date;

  @Column({ type: "date", nullable: true })
  fechaFin!: Date;

  @Column({ type: "text", nullable: true })
  motivoTermino!: string;

  @Column({ type: "text", nullable: true })
  observaciones!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  contratoURL!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  afp!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  previsionSalud!: string;

  @Column({ type: "boolean", nullable: true })
  seguroCesantia!: boolean;

  @Column({ type: "varchar", length: 30, nullable: true })
  estado!: string;

  @Column({ type: "date", nullable: true })
  fechaInicioLicencia!: Date;

  @Column({ type: "date", nullable: true })
  fechaFinLicencia!: Date;

  @Column({ type: "text", nullable: true })
  motivoLicencia!: string;

  @ManyToOne("Trabajador", { onDelete: "CASCADE" })
  @JoinColumn({ name: "trabajadorId" })
  trabajador!: any;

  @ManyToOne("User", { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "registradoPorId" })
  registradoPor!: any;

  @CreateDateColumn({ type: "timestamp" })
  createAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updateAt!: Date;
} 