import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"

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
  valorCompra!: number // Valor original de compra

  @Column({ type: "decimal", precision: 15, scale: 2, nullable: false })
  valorVenta!: number // Valor de venta

  // Campos opcionales
  @Column({ type: "varchar", length: 255, nullable: true })
  comprador?: string

  @Column({ type: "text", nullable: true })
  observaciones?: string

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  fechaRegistro!: Date

  @ManyToOne(
    "maquinarias",
    (maquinarias: any) => maquinarias.ventas,
  )
  @JoinColumn({ name: "maquinariaId" })
  maquinaria!: any
}
