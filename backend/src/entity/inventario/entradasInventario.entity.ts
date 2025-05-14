import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from "typeorm"
import { Inventario } from "./inventario.entity.js"
import { Proveedor } from "../clientesProveedores/proveedores.entity.js"

@Entity("entradas_inventario")
export class EntradaInventario {
  @PrimaryGeneratedColumn()
  id!: number

  @Index()
  @ManyToOne(
    () => Inventario,
    (inventario) => inventario.entradas,
    { nullable: false },
  )
  inventario!: Inventario

  @Index()
  @ManyToOne(
    () => Proveedor,
    (proveedor) => proveedor.entradas,
    { nullable: false },
  )
  proveedor!: Proveedor

  @Column({ type: "int", nullable: false })
  cantidad!: number

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  precioCompra!: number

  @Index()
  @CreateDateColumn()
  fechaEntrada!: Date
}
