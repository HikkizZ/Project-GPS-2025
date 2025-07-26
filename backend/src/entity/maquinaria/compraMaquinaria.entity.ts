import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"

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

  @Column({ type: "varchar", length: 255, nullable: true })
  proveedor?: string

  @Column({ type: "text", nullable: true })
  observaciones?: string

  // Campos para el padrón
  @Column({ type: "varchar", length: 500, nullable: true })
  padronUrl?: string

  @Column({ type: "varchar", length: 255, nullable: true })
  padronFilename?: string

  @Column({ type: "enum", enum: ["image", "pdf"], nullable: true })
  padronFileType?: "image" | "pdf"

  @Column({ type: "varchar", length: 255, nullable: true })
  padronOriginalName?: string

  @Column({ type: "int", nullable: true })
  padronFileSize?: number

  @CreateDateColumn()
  fechaCreacion!: Date

  @UpdateDateColumn()
  fechaActualizacion!: Date

  // Relación con Maquinaria
  @ManyToOne(
    "maquinarias",
    (maquinarias: any) => maquinarias.compras,
    {
      nullable: true,
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "maquinaria_id" })
  maquinaria?: any;

  @Column({ type: "int", nullable: true })
  maquinaria_id?: number
}
