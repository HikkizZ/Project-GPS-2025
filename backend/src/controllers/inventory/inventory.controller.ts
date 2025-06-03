import { Request, Response } from 'express';

import {
    getAllInventoryService
} from '../../services/inventory/inventory.service.js';

import { handleSuccess, handleErrorClient, handleErrorServer } from '../../handlers/responseHandlers.js';

export async function getAllInventory(req: Request, res: Response): Promise<void> {
    try {
        const [inventory, err] = await getAllInventoryService();

        if (err) {
            handleErrorServer(res, 500, typeof err === 'string' ? err : err.message);
            return;
        }

        if (!inventory || inventory.length === 0) {
            handleErrorClient(res, 404, 'No se encontraron registros de inventario.');
            return;
        }

        handleSuccess(res, 200, 'Inventario obtenido correctamente.', inventory);
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);
    }
}