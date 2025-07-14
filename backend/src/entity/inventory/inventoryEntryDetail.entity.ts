/**
 * Detalle individual de productos incluidos en una entrada al inventario.
 * Define cantidad del producto, precio unitario y total de compra.
 */

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Product } from './product.entity.js';

@Entity("inventory_entry_details")
export class InventoryEntryDetail {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne("inventory_entries", { nullable: false })
    entry!: any;

    @ManyToOne(() => Product)
    product!: Product;

    @Column({ type: 'integer', nullable: false })
    quantity!: number;

    @Column({ type: 'integer', nullable: false })
    purchasePrice!: number;

    @Column({ type: 'integer', nullable: false })
    totalPrice!: number;
}