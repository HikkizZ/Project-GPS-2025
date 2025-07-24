import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"

@Entity("arriendos_maquinaria")
export class ArriendoMaquinaria {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "varchar", length: 50, nullable: false, unique: true })
  numeroReporte!: string

  // Relación con Maquinaria
  @ManyToOne("maquinarias", { nullable: false })
  @JoinColumn({ name: "maquinaria_id" })
  maquinaria!: any;

  @Column({ type: "int", name: "maquinaria_id" })
  maquinariaId!: number

  // Campos del reporte físico (copiados tal como vienen)
  @Column({ type: "varchar", length: 20, nullable: false })
  patente!: string

  @Column({ type: "varchar", length: 100, nullable: false })
  marca!: string

  @Column({ type: "varchar", length: 100, nullable: false })
  modelo!: string

  // Datos del cliente (del reporte físico)
  @Column({ type: "varchar", length: 12, nullable: false })
  rutCliente!: string

  @Column({ type: "varchar", length: 255, nullable: false })
  nombreCliente!: string

  // Datos del trabajo realizado
  @Column({ type: "varchar", length: 500, nullable: false })
  obra!: string

  @Column({ type: "text", nullable: true })
  detalle!: string

  // Kilometraje final del día (actualiza kilometrajeActual en maquinaria)
  @Column({ type: "int", nullable: false })
  kmFinal!: number

  // Valor del servicio realizado
  @Column({ type: "decimal", precision: 12, scale: 2, nullable: false })
  valorServicio!: number

  // Fecha del trabajo (se puede inferir de la fecha de creación o ingresar manualmente)
  @Column({ type: "date", nullable: false })
  fechaTrabajo!: Date

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
