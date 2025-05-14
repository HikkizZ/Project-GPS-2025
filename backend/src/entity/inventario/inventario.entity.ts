import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { EntradaInventario } from "./entradasInventario.entity.js";
import { VentaInventario } from "./ventasInventario.entity.js";

@Entity("inventario")
export class Inventario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  nombreProducto!: string;

  @Column({ type: "int", nullable: false })
  precioVenta!: number;

  @Column({ type: "int", nullable: false })
  cantidadDisponible!: number;

  @OneToMany(() => EntradaInventario, entrada => entrada.inventario)
  entradas!: EntradaInventario[];

  @OneToMany(() => VentaInventario, venta => venta.inventario)
  ventas!: VentaInventario[];
}
