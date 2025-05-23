/**
 * RStock actual de cada producto en el inventario.
 * Es una fila única por producto, que se actualiza según entradas y salidas.
 */

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from "typeorm";
import { Product } from "./product.entity.js";

@Entity("inventory")
export class Inventory {
    @PrimaryGeneratedColumn()
    id!: number;

    @Index(["product"], {unique: true})
    @ManyToOne(() => Product, { eager: true }) //? Para que la relación se cargue automáticamente
    product!: Product;

    @Column({ type: "integer", nullable: false })
    quantity!: number;
}