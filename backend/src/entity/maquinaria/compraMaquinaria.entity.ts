import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { Maquinaria } from "./maquinaria.entity.js"

// Importar el enum explícitamente
export enum GrupoMaquinaria {
  CAMION_TOLVA = "camion_tolva",
  BATEA = "batea",
  CAMA_BAJA = "cama_baja",
  PLUMA = "pluma",
  ESCAVADORA = "escavadora",
  RETROEXCAVADORA = "retroexcavadora",
  CARGADOR_FRONTAL = "cargador_frontal",
}

@Entity("compras_maquinaria")
export class CompraMaquinaria {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "int", nullable: false })
  maquinariaId!: number

  // Campos de la compra (casi iguales a maquinaria)
  @Column({ type: "varchar", length: 20, nullable: false })
  patente!: string

  @Column({
    type: "enum",
    enum: GrupoMaquinaria,
    enumName: "grupo_maquinaria",
    nullable: false,
  })
  grupo!: GrupoMaquinaria

  @Column({ type: "varchar", length: 100, nullable: false })
  marca!: string

  @Column({ type: "varchar", length: 100, nullable: false })
  modelo!: string

  @Column({ type: "int", nullable: false })
  año!: number

  @Column({ type: "date", nullable: false })
  fechaCompra!: Date

  @Column({ type: "decimal", precision: 15, scale: 2, nullable: false })
  valorCompra!: number

  @Column({ type: "decimal", precision: 15, scale: 2, nullable: false })
  avaluoFiscal!: number

  @Column({ type: "varchar", length: 100, nullable: false })
  numeroChasis!: string

  @Column({ type: "int", nullable: false })
  kilometrajeInicial!: number

  @Column({ type: "int", nullable: false })
  kilometrajeActual!: number

  // Campos específicos de la compra
  @Column({ type: "varchar", length: 255, nullable: true })
  proveedor?: string

  @Column({ type: "text", nullable: true })
  observaciones?: string

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  fechaRegistro!: Date

  @ManyToOne(
    () => Maquinaria,
    (maquinaria) => maquinaria.compras,
  )
  @JoinColumn({ name: "maquinariaId" })
  maquinaria!: Maquinaria
}
