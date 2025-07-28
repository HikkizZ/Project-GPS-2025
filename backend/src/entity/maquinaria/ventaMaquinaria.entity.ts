import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { Customer } from "../stakeholders/customer.entity.js"

@Entity("ventas_maquinaria")
export class VentaMaquinaria {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "int", nullable: false })
  maquinariaId!: number

  // Campos simples para la venta
  @Column({ type: "varchar", length: 20, nullable: false })
  patente!: string

  @Column({ type: "date", nullable: false })
  fechaVenta!: Date

  @Column({ type: "decimal", precision: 15, scale: 2, nullable: false })
  valorCompra!: number

  @Column({ type: "decimal", precision: 15, scale: 2, nullable: false })
  valorVenta!: number

  // Relación con Customer
  @Column({ type: "int", nullable: false })
  customerId!: number

  @Column({ type: "varchar", length: 12, nullable: false })
  customerRut!: string

  @Column({ type: "varchar", length: 255, nullable: true })
  comprador?: string

  @Column({ type: "text", nullable: true })
  observaciones?: string

  @Column({ type: "boolean", default: true })
  isActive!: boolean

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  fechaRegistro!: Date

  // Relaciones
  @ManyToOne("maquinarias", (maquinarias: any) => maquinarias.ventas)
  @JoinColumn({ name: "maquinariaId" })
  maquinaria!: any

  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn({ name: "customerId" })
  customer!: Customer
}
