import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"
import { Maquinaria } from "./maquinaria.entity.js"
import { Customer } from "../stakeholders/customer.entity.js"
import { User } from "../user.entity.js"

@Entity("arriendos_maquinaria")
export class ArriendoMaquinaria {
  @PrimaryGeneratedColumn()
  id!: number

  // Relación con Maquinaria
  @ManyToOne(() => Maquinaria, { nullable: false })
  @JoinColumn({ name: "maquinaria_id" })
  maquinaria!: Maquinaria

  @Column({ type: "int", name: "maquinaria_id" })
  maquinariaId!: number

  // Campos de maquinaria desnormalizados para consultas rápidas
  @Column({ type: "varchar", length: 20, nullable: false })
  patente!: string

  @Column({ type: "varchar", length: 100, nullable: false })
  marca!: string

  @Column({ type: "varchar", length: 100, nullable: false })
  modelo!: string

  // Relación con Cliente
  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn({ name: "customer_id" })
  cliente!: Customer

  @Column({ type: "int", name: "customer_id" })
  clienteId!: number

  // Campos de cliente desnormalizados
  @Column({ type: "varchar", length: 12, nullable: false })
  rutCliente!: string

  @Column({ type: "varchar", length: 255, nullable: false })
  nombreCliente!: string

  // Relación con Conductor (User con rol Conductor)
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "conductor_id" })
  conductor!: User

  @Column({ type: "int", name: "conductor_id" })
  conductorId!: number

  // Campos de conductor desnormalizados
  @Column({ type: "varchar", length: 20, nullable: false })
  rutConductor!: string

  @Column({ type: "varchar", length: 100, nullable: false })
  nombreConductor!: string

  // Datos del arriendo diario
  @Column({ type: "date", nullable: false })
  fecha!: Date

  @Column({ type: "decimal", precision: 12, scale: 2, nullable: false })
  montoTotal!: number

  // Kilometraje
  @Column({ type: "int", nullable: false })
  kilometrajeInicial!: number

  @Column({ type: "int", nullable: true })
  kilometrajeFinal!: number

  // Obra donde se realizará el trabajo
  @Column({ type: "varchar", length: 500, nullable: false })
  obra!: string

  // Observaciones y condiciones
  @Column({ type: "text", nullable: true })
  observaciones!: string

  // Datos de contacto de emergencia
  @Column({ type: "varchar", length: 15, nullable: true })
  telefonoEmergencia!: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
