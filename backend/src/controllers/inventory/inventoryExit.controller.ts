import { Request, Response } from 'express';
import {
  createInventoryExitService,
  getAllInventoryExitsService,
  getInventoryExitByIdService,
  deleteInventoryExitService
} from '../../services/inventory/inventoryExit.service.js';

import { CreateInventoryExitDTO } from '../../types/inventory/inventory.dto.js';
import { handleSuccess, handleErrorClient, handleErrorServer } from '../../handlers/responseHandlers.js';
import { createInventoryExitValidation, inventoryQueryValidation } from '../../validations/inventory/inventory.validation.js';

export async function createInventoryExit(req: Request, res: Response): Promise<void> {
    try {
        const { error } = createInventoryExitValidation.validate(req.body);

        if (error) {
            handleErrorClient(res, 400, error.message);
            return;
        }

        const exitData: CreateInventoryExitDTO = req.body;

        const [exit, err] = await createInventoryExitService(exitData);

        if (!exit) {
            handleErrorClient(res, 400, typeof err === 'string' ? err : err!.message || 'Error al crear la salida de inventario.');
            return;
        }

        if (err) {
            handleErrorClient(res, 400, typeof err === 'string' ? err : err.message);
            return;
        }

        handleSuccess(res, 201, 'Salida registrada exitosamente.', exit);
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);
    }
}

export async function getAllInventoryExits(_req: Request, res: Response): Promise<void> {
    try {
        const [exits, err] = await getAllInventoryExitsService();

        if (err) {
            handleErrorServer(res, 500, typeof err === 'string' ? err : err.message);
            return;
        }

        if (!exits || exits.length === 0) {
            handleErrorClient(res, 404, 'No se encontraron salidas de inventario.');
            return;
        }

        handleSuccess(res, 200, 'Salidas obtenidas correctamente.', exits);
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);
    }
}

export async function getInventoryExitById(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.query;

        const parsedId = id ? Number(id) : undefined;

        const { error } = inventoryQueryValidation.validate({ id: parsedId });

        if (error || parsedId === undefined) {
            handleErrorClient(res, 400, error?.message ?? "El parámetro 'id' es obligatorio");
            return;
        }

        const [exit, err] = await getInventoryExitByIdService(parsedId);

        if (err) {
            handleErrorClient(res, 404, typeof err === 'string' ? err : err.message);
            return;
        }

        if (!exit) {
            handleErrorClient(res, 404, 'Salida de inventario no encontrada.');
            return;
        }

        handleSuccess(res, 200, 'Salida obtenida correctamente.', exit);
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);
    }
}

export async function deleteInventoryExit(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.query;

        const parsedId = id ? Number(id) : undefined;

        const { error } = inventoryQueryValidation.validate({ id: parsedId });

        if (error || parsedId === undefined) {
            handleErrorClient(res, 400, error?.message ?? "El parámetro 'id' es obligatorio");
            return;
        }

        const [exit, err] = await deleteInventoryExitService(parsedId);

        if (err) {
            handleErrorServer(res, 500, typeof err === 'string' ? err : err.message);
            return;
        }

        if (!exit) {
            handleErrorClient(res, 404, 'Salida de inventario no encontrada.');
            return;
        }

        handleSuccess(res, 200, 'Salida eliminada correctamente.', exit);
    } catch (error) {
        handleErrorServer(res, 500, (error as Error).message);
    }
}