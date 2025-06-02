import { AppDataSource } from '../../config/configDB.js';
import { InventoryEntry } from '../../entity/inventory/inventoryEntry.entity.js';
import { InventoryEntryDetail } from '../../entity/inventory/inventoryEntryDetail.entity.js';
import { Supplier } from '../../entity/supplier.entity.js';
import { Product } from '../../entity/inventory/product.entity.js';
import { CreateInventoryEntryDTO } from '../../types/index.js';
import { ServiceResponse } from '../../../types.js';
import { incrementInventory } from './inventory.service.js';

export async function createInventoryEntryService(entryData: CreateInventoryEntryDTO): Promise<ServiceResponse<InventoryEntry>> {
    try {
        const supplierRepo = AppDataSource.getRepository(Supplier);
        const productRepo = AppDataSource.getRepository(Product);
        const entryRepo = AppDataSource.getRepository(InventoryEntry);

        const supplier = await supplierRepo.findOne({ where: { rut: entryData.supplierRut } });

        if (!supplier) return [null, "Proveedor no encontrado."];

        const entry = new InventoryEntry();
        entry.supplier = supplier;

        entry.details = [];

        for (const detail of entryData.details) {
            const product = await productRepo.findOne({ where: { id: detail.productId } });
            if (!product) return [null, `Producto con ID ${detail.productId} no encontrado.`];

            const entryDetail = new InventoryEntryDetail();
            entryDetail.product = product;
            entryDetail.quantity = detail.quantity;
            entryDetail.purchasePrice = detail.purchasePrice;
            entryDetail.totalPrice = detail.quantity * detail.purchasePrice;

            const [_, inventoryError] = await incrementInventory(detail.productId, detail.quantity);
            if (inventoryError) return [null, inventoryError];

            entry.details.push(entryDetail);
        }

        const savedEntry = await entryRepo.save(entry);
        return [savedEntry, null];
    } catch (error) {
        console.error("Error al crear la entrada de inventario:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function getAllInventoryEntriesService(): Promise<ServiceResponse<InventoryEntry[]>> {
    try {
        const entryRepo = AppDataSource.getRepository(InventoryEntry);
        const entries = await entryRepo.find({ relations: ['supplier', 'details', 'details.product'] });

        return [entries, null];
    } catch (error) {
        console.error("Error al obtener entradas de inventario:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function getInventoryEntryByIdService(id: number): Promise<ServiceResponse<InventoryEntry>> {
    try {
        const entryRepo = AppDataSource.getRepository(InventoryEntry);
        const entry = await entryRepo.findOne({
            where: { id },
            relations: ['supplier', 'details', 'details.product']
        });

        if (!entry) return [null, "Entrada de inventario no encontrada."];

        return [entry, null];
    } catch (error) {
        console.error("Error al obtener entrada por ID:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function deleteInventoryEntryService(id: number): Promise<ServiceResponse<InventoryEntry>> {
    try {
        const entryRepo = AppDataSource.getRepository(InventoryEntry);
        const entry = await entryRepo.findOne({ where: { id }, relations: ['details'] });

        if (!entry) return [null, "Entrada no encontrada."];

        await entryRepo.remove(entry);
        return [entry, null];
    } catch (error) {
        console.error("Error al eliminar entrada:", error);
        return [null, "Error interno del servidor"];
    }
}
