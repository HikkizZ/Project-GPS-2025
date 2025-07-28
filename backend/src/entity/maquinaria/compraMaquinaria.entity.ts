import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm"
import { Supplier } from "../stakeholders/supplier.entity.js"

export enum GrupoMaquinaria {
  CAMION_TOLVA = "camion_tolva",
  BATEA = "batea",
  CAMA_BAJA = "cama_baja",
  PLUMA = "pluma",
  ESCAVADORA = "escavadora",
  RETROEXCAVADORA = "retroexcavadora",
  CARGADOR_FRONTAL = "cargador_frontal",
}

@Entity("compra_maquinaria")
@Index("IDX_compra_maquinaria_active", ["isActive"])
export class CompraMaquinaria {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "varchar", length: 20 })
  patente!: string

  @Column({
    type: "enum",
    enum: GrupoMaquinaria,
    default: GrupoMaquinaria.ESCAVADORA,
  })
  grupo!: GrupoMaquinaria

  @Column({ type: "varchar", length: 100 })
  marca!: string

  @Column({ type: "varchar", length: 100 })
  modelo!: string

  @Column({ type: "int" })
  anio!: number

  @Column({ type: "date" })
  fechaCompra!: string

  @Column({ type: "decimal", precision: 15, scale: 2 })
  valorCompra!: number

  @Column({ type: "decimal", precision: 15, scale: 2 })
  avaluoFiscal!: number

  @Column({ type: "varchar", length: 100 })
  numeroChasis!: string

  @Column({ type: "int", default: 0 })
  kilometrajeInicial!: number

  // Relación con Supplier
  @Column({ type: "int", nullable: true })
  supplierId?: number

  @Column({ type: "varchar", length: 12, nullable: true })
  supplierRut?: string

  @Column({ type: "varchar", length: 255, nullable: true })
  proveedor?: string

  @Column({ type: "text", nullable: true })
  observaciones?: string

  // Padrón
  @Column({ type: "varchar", length: 500, nullable: true })
  padronUrl?: string

  @CreateDateColumn()
  fechaCreacion!: Date

  @UpdateDateColumn()
  fechaActualizacion!: Date

  // Relación con Maquinaria
  @ManyToOne("maquinarias", (maquinarias: any) => maquinarias.compras, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "maquinaria_id" })
  maquinaria?: any

  @Column({ type: "int", nullable: true })
  maquinaria_id?: number

  @Column({ type: "boolean", default: true })
  isActive!: boolean

  // Relaciones
  @ManyToOne(() => Supplier, { nullable: true })
  @JoinColumn({ name: "supplierId" })
  supplier?: Supplier
}
