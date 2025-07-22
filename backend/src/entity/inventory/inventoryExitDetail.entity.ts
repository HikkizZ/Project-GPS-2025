/**
 * Detalle individual de productos incluidos en una salida del inventario.
 * Define cantidad, precio de venta por producto y total de la venta.
 */

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Product } from './product.entity.js';

@Entity("inventory_exit_details")
export class InventoryExitDetail {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne("inventory_exits", { nullable: false })
    exit!: any;

    @ManyToOne(() => Product)
    product!: Product;

    @Column({ type: 'integer', nullable: false })
    quantity!: number;

    @Column({ type: 'integer', nullable: false })
    salePrice!: number;

    @Column({ type: 'integer', nullable: false })
    totalPrice!: number;
}