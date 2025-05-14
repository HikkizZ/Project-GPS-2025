import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from "typeorm"
import { EntradaInventario } from "../inventario/entradasInventario.entity.js"

@Entity("proveedores")
export class Proveedor {
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
    () => EntradaInventario,
    (entrada) => entrada.proveedor,
  )
  entradas!: EntradaInventario[]
}
