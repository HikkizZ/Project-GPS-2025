/**
 * Transacción de entrada de productos al inventario.
 * Se registra la fecha de entrada, el proveedor y los detalles de los productos.
 */

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Supplier } from "../stakeholders/supplier.entity.js";
import { InventoryEntryDetail } from "./inventoryEntryDetail.entity.js";

@Entity("inventory_entries")
export class InventoryEntry {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    entryDate!: Date;

    @ManyToOne(() => Supplier)
    supplier!: Supplier;

    @OneToMany(() => InventoryEntryDetail, detail => detail.entry, { cascade: true })
    details!: InventoryEntryDetail[];
}