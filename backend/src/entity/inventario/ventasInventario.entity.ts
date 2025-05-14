import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from "typeorm"
import { Inventario } from "./inventario.entity.js"
import { Cliente } from "../clientesProveedores/clientes.entity.js"

@Entity("ventas_inventario")
export class VentaInventario {
  @PrimaryGeneratedColumn()
  id!: number

  @Index()
  @ManyToOne(
    () => Inventario,
    (inventario) => inventario.ventas,
    { nullable: false },
  )
  inventario!: Inventario

  @Index()
  @ManyToOne(
    () => Cliente,
    (cliente) => cliente.ventas,
    { nullable: false },
  )
  cliente!: Cliente

  @Column({ type: "int", nullable: false })
  cantidad!: number

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  precioVenta!: number

  @Index()
  @CreateDateColumn()
  fechaVenta!: Date
}
