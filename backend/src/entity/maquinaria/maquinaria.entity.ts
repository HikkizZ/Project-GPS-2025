import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from "typeorm"
import { CompraMaquinaria } from "./compraMaquinaria.entity.js"
import { VentaMaquinaria } from "./ventaMaquinaria.entity.js"

export enum GrupoMaquinaria {
  CAMION_TOLVA = "camion_tolva",
  BATEA = "batea",
  CAMA_BAJA = "cama_baja",
  PLUMA = "pluma",
  ESCAVADORA = "escavadora",
  RETROEXCAVADORA = "retroexcavadora",
  CARGADOR_FRONTAL = "cargador_frontal",
}

export enum EstadoMaquinaria {
  DISPONIBLE = "disponible",
  MANTENIMIENTO = "mantenimiento",
  VENDIDA = "vendida",
  FUERA_SERVICIO = "fuera_servicio",
}

@Entity("maquinarias")
export class Maquinaria {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ type: "varchar", length: 20, nullable: false })
  patente!: string

  @Column({
    type: "enum",
    enum: GrupoMaquinaria,
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

  @Index({ unique: true })
  @Column({ type: "varchar", length: 100, nullable: false, unique: true })
  numeroChasis!: string

  @Column({ type: "int", nullable: false })
  kilometrajeInicial!: number

  @Column({ type: "int", nullable: false })
  kilometrajeActual!: number

  @Column({
    type: "enum",
    enum: EstadoMaquinaria,
    default: EstadoMaquinaria.DISPONIBLE,
  })
  estado!: EstadoMaquinaria

  // Campo agregado para el archivo del padrón
  @Column({ type: "varchar", length: 500, nullable: true })
  padronUrl?: string

  // Campo agregado para soft delete
  @Column({ type: "boolean", default: true })
  isActive!: boolean

  // Relaciones
  @OneToMany(
    () => CompraMaquinaria,
    (compra) => compra.maquinaria,
  )
  compras!: CompraMaquinaria[]

  @OneToMany(
    () => VentaMaquinaria,
    (venta) => venta.maquinaria,
  )
  ventas!: VentaMaquinaria[]
}
