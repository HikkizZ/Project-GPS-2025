import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from "typeorm"

export enum GrupoMaquinaria {
  CAMION_TOLVA = "camion_tolva",
  BATEA = "batea",
  CAMA_BAJA = "cama_baja",
  PLUMA = "pluma",
  ESCAVADORA = "escavadora",
  RETROEXCAVADORA = "retroexcavadora",
  CARGADOR_FRONTAL = "cargador_frontal",
}

export enum EstadoVenta {
  DISPONIBLE = "disponible",
  RESERVADA = "reservada",
  VENDIDA = "vendida",
  RETIRADA = "retirada",
}

@Entity("ventas_maquinaria")
export class VentaMaquinaria {
  @PrimaryGeneratedColumn()
  id!: number

  // Campos copiados de Maquinaria (cuando se transfiere a ventas)
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

  // Campo adicional: Valor de Venta
  @Column({ type: "decimal", precision: 15, scale: 2, nullable: false })
  valorVenta!: number

  // Campos específicos del módulo de ventas
  @Column({
    type: "enum",
    enum: EstadoVenta,
    nullable: false,
    default: EstadoVenta.DISPONIBLE,
  })
  estadoVenta!: EstadoVenta

  @Column({ type: "date", nullable: true })
  fechaPublicacion?: Date

  @Column({ type: "date", nullable: true })
  fechaVenta?: Date

  @Column({ type: "varchar", length: 100, nullable: true })
  nombreComprador?: string

  @Column({ type: "varchar", length: 20, nullable: true })
  rutComprador?: string

  @Column({ type: "varchar", length: 200, nullable: true })
  direccionComprador?: string

  @Column({ type: "varchar", length: 20, nullable: true })
  telefonoComprador?: string

  @Column({ type: "text", nullable: true })
  observacionesVenta?: string

  @Column({ type: "varchar", length: 100, nullable: true })
  numeroFacturaVenta?: string

  @Column({ type: "varchar", length: 50, nullable: true })
  metodoPago?: string

  // ID de la maquinaria original (para referencia histórica)
  @Column({ type: "int", nullable: true })
  maquinariaOriginalId?: number

  @CreateDateColumn()
  fechaCreacion!: Date

  @UpdateDateColumn()
  fechaActualizacion!: Date

  // Métodos calculados
  get ganancia(): number {
    return this.valorVenta - this.valorCompra
  }

  get porcentajeGanancia(): number {
    if (this.valorCompra === 0) return 0
    return ((this.valorVenta - this.valorCompra) / this.valorCompra) * 100
  }

  get diasEnVenta(): number {
    if (!this.fechaPublicacion) return 0
    const fechaFin = this.fechaVenta || new Date()
    const diferencia = fechaFin.getTime() - this.fechaPublicacion.getTime()
    return Math.floor(diferencia / (1000 * 60 * 60 * 24))
  }
}
