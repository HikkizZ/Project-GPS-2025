/**
 * Transacción de salida de productos del inventario.
 * Se registra la fecha de salida, el cliente y los detalles de los productos.
 */

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Customer } from '../customer.entity.js';
import { InventoryExitDetail } from './inventoryExitDetail.entity.js';

@Entity("inventory_exits")
export class InventoryExit {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Customer)
    customer!: Customer;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    exitDate!: Date;

    @OneToMany(() => InventoryExitDetail, detail => detail.exit, { cascade: true })
    details!: InventoryExitDetail[];
}