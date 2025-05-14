import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from "typeorm"
import { VentaInventario } from "../inventario/ventasInventario.entity.js"

@Entity("clientes")
export class Cliente {
  @PrimaryGeneratedColumn()
  id!: number

  @Index({ unique: true })
  @Column({ type: "varchar", length: 15, nullable: false, unique: true })
  rut!: string

  @Column({ type: "varchar", length: 255, nullable: false })
  nombre!: string

  @Column({ type: "varchar", length: 255, nullable: false })
  direccion!: string

  @Column({ type: "varchar", length: 100, nullable: false })
  contacto!: string

  @OneToMany(
    () => VentaInventario,
    (venta) => venta.cliente,
  )
  ventas!: VentaInventario[]
}
