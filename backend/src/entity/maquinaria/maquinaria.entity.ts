import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm"

export enum GrupoMaquinaria {
  CAMION_TOLVA = "camion_tolva",
  BATEA = "batea",
  CAMA_BAJA = "cama_baja",
  PLUMA = "pluma",
  ESCAVADORA = "escavadora",
  RETROEXCAVADORA = "retroexcavadora",
  CARGADOR_FRONTAL = "cargador_frontal",
}

@Entity("maquinarias")
export class Maquinaria {
  @PrimaryGeneratedColumn()
  id!: number

  @Index({ unique: true })
  @Column({ type: "varchar", length: 20, nullable: false, unique: true })
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

  @Column({ type: "varchar", length: 100, nullable: true })
  numeroChasis?: string

  @Column({ type: "int", nullable: false })
  kilometrajeInicial!: number

  @Column({ type: "int", nullable: false })
  kilometrajeActual!: number
}