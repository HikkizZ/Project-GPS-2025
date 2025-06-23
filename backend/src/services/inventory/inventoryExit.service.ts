import { AppDataSource } from "../../config/configDB.js";
import { InventoryExit } from "../../entity/inventory/inventoryExit.entity.js";
import { InventoryExitDetail } from "../../entity/inventory/inventoryExitDetail.entity.js";
import { Product } from "../../entity/inventory/product.entity.js";
import { Customer } from "../../entity/stakeholders/customer.entity.js";
import { CreateInventoryExitDTO } from "../../types/inventory/inventory.dto.js";
import { ServiceResponse } from "../../../types.js";
import { decrementInventory } from "./inventory.service.js";

export async function createInventoryExitService(exitData: CreateInventoryExitDTO): Promise<ServiceResponse<InventoryExit>> {
    try {
        const customerRepo = AppDataSource.getRepository(Customer);
        const productRepo = AppDataSource.getRepository(Product);
        const exitRepo = AppDataSource.getRepository(InventoryExit);

        const customer = await customerRepo.findOne({ where: { rut: exitData.customerRut } });

        if (!customer) return [null, "Cliente no encontrado."];

        const exit = new InventoryExit();
        exit.customer = customer;

        exit.details = [];

        for (const detail of exitData.details) {
            const product = await productRepo.findOne({ where: { id: detail.productId } });
            if (!product) return [null, `Producto con ID ${detail.productId} no encontrado.`];

            const exitDetail = new InventoryExitDetail();
            exitDetail.product = product;
            exitDetail.quantity = detail.quantity;
            exitDetail.salePrice = product.salePrice;
            exitDetail.totalPrice = detail.quantity * product.salePrice;

            const [_, inventoryError] = await decrementInventory(detail.productId, detail.quantity);
            if (inventoryError) return [null, inventoryError];

            exit.details.push(exitDetail);
        }

        const savedExit = await exitRepo.save(exit);
        return [savedExit, null];
    } catch (error) {
        console.error("Error al crear la salida de inventario:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function getAllInventoryExitsService(): Promise<ServiceResponse<InventoryExit[]>> {
    try {
        const exitRepo = AppDataSource.getRepository(InventoryExit);
        
        const exits = await exitRepo.find({ relations: ['customer', 'details', 'details.product'] });

        if (exits.length === 0) {
            return [[], "No se encontraron salidas de inventario."];
        }

        return [exits, null];
    } catch (error) {
        console.error("Error al obtener salidas de inventario:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function getInventoryExitByIdService(id: number): Promise<ServiceResponse<InventoryExit>> {
    try {
        const exitRepo = AppDataSource.getRepository(InventoryExit);

        const exit = await exitRepo.findOne({
            where: { id },
            relations: ['customer', 'details', 'details.product']
        });

        if (!exit) return [null, "Salida de inventario no encontrada."];

        return [exit, null];
    } catch (error) {
        console.error("Error al obtener salida de inventario por ID:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function deleteInventoryExitService(id: number): Promise<ServiceResponse<InventoryExit>> {
    try {
        const exitRepo = AppDataSource.getRepository(InventoryExit);

        const exit = await exitRepo.findOne({ where: { id }, relations: ['details'] });

        if (!exit) return [null, "Salida de inventario no encontrada."];

        await exitRepo.remove(exit);
        return [exit, null];
    } catch (error) {
        console.error("Error al eliminar salida de inventario:", error);
        return [null, "Error interno del servidor"];
    }
}