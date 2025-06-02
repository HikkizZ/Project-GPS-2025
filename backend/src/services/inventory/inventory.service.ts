import { AppDataSource } from "../../config/configDB.js";
import { Inventory } from "../../entity/inventory/inventory.entity.js";
import { Product } from "../../entity/inventory/product.entity.js";
import { ServiceResponse } from "../../../types.js";

export async function incrementInventory(productId: number, quantity: number): Promise<ServiceResponse<Inventory>> {
    try {
        const inventoryRepo = AppDataSource.getRepository(Inventory);
        const productRepo = AppDataSource.getRepository(Product);

        const product = await productRepo.findOne({ where: { id: productId } });
        if (!product) return [null, "Producto no encontrado."];

        let inventory = await inventoryRepo.findOne({ where: { product: { id: productId } } });

        if (inventory) {
            inventory.quantity += quantity;
        } else {
            inventory = inventoryRepo.create({
                product: product,
                quantity: quantity
            });
        }

        const savedInventory = await inventoryRepo.save(inventory);
        return [savedInventory, null];
    } catch (error) {
        console.error("Error al incrementar inventario:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function decrementInventory(productId: number, quantity: number): Promise<ServiceResponse<Inventory>> {
    try {
        const inventoryRepo = AppDataSource.getRepository(Inventory);
        const productRepo = AppDataSource.getRepository(Product);

        const product = await productRepo.findOne({ where: { id: productId } });
        if (!product) return [null, "Producto no encontrado."];

        const inventory = await inventoryRepo.findOne({ where: { product: { id: productId } } });

        if (!inventory) return [null, "Inventario no encontrado para el producto."];
        if (inventory.quantity < quantity) {
            return [null, "Cantidad insuficiente en inventario."];
        }

        inventory.quantity -= quantity;

        const savedInventory = await inventoryRepo.save(inventory);
        return [savedInventory, null];
    } catch (error) {
        console.error("Error al decrementar inventario:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function getAllInventoryService(): Promise<ServiceResponse<Inventory[]>> {
    try {
        const inventoryRepo = AppDataSource.getRepository(Inventory);

        const inventoryList = await inventoryRepo.find({ relations: ['product'] });

        if (inventoryList.length === 0) {
            return [[], "No se encontraron registros de inventario."];
        }

        return [inventoryList, null];
    } catch (error) {
        console.error("Error al obtener inventario:", error);
        return [null, "Error interno del servidor"];
    }
}