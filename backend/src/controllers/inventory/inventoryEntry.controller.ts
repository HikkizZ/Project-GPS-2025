import { Request, Response } from 'express';
import {
  createInventoryEntryService,
  getAllInventoryEntriesService,
  getInventoryEntryByIdService,
  deleteInventoryEntryService
} from '../../services/inventory/inventoryEntry.service.js';

import { CreateInventoryEntryDTO } from '../../types/index.js';
import { handleSuccess, handleErrorClient, handleErrorServer } from '../../handlers/responseHandlers.js';
import { createInventoryEntryValidation, inventoryQueryValidation } from '../../validations/inventory/inventory.validation.js';

export async function createInventoryEntry(req: Request, res: Response): Promise<void> {
  try {
    const { error } = createInventoryEntryValidation.validate(req.body);

    if (error) {
      handleErrorClient(res, 400, error.message);
      return;
    }

    const entryData: CreateInventoryEntryDTO = req.body;

    const [entry, err] = await createInventoryEntryService(entryData);

    if (!entry) {
      handleErrorClient(res, 400, typeof err === 'string' ? err : err!.message || 'Error al crear la entrada de inventario.');
      return;
    }

    if (err) {
      handleErrorClient(res, 400, typeof err === 'string' ? err : err.message);
      return;
    }

    handleSuccess(res, 201, 'Entrada registrada exitosamente.', entry);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}

export async function getAllInventoryEntries(_req: Request, res: Response): Promise<void> {
  try {
    const [entries, err] = await getAllInventoryEntriesService();

    if (err) {
      handleErrorServer(res, 500, typeof err === 'string' ? err : err.message);
      return;
    }

    if (!entries || entries.length === 0) {
      handleErrorClient(res, 404, 'No se encontraron entradas de inventario.');
      return;
    }

    handleSuccess(res, 200, 'Entradas obtenidas correctamente.', entries);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}

export async function getInventoryEntryById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.query

    const parsedId = id ? Number(id) : undefined;

    const { error } = inventoryQueryValidation.validate({ id: parsedId });

    if (error || parsedId === undefined) {
      handleErrorClient(res, 400, error?.message ?? "El parámetro 'id' es obligatorio.");
      return;
    }

    const [entry, err] = await getInventoryEntryByIdService(parsedId);

    if (err) {
      handleErrorClient(res, 404, typeof err === 'string' ? err : err.message);
      return;
    }

    if (!entry) {
      handleErrorClient(res, 404, 'Entrada de inventario no encontrada.');
      return;
    }

    handleSuccess(res, 200, 'Entrada obtenida correctamente.', entry);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}

export async function deleteInventoryEntry(req: Request, res: Response): Promise<void> {
  try {

    const { id } = req.query;

    const parsedId = id ? Number(id) : undefined;

    const { error } = inventoryQueryValidation.validate({ id: parsedId });

    if (error || parsedId === undefined) {
      handleErrorClient(res, 400, error?.message ?? "El parámetro 'id' es obligatorio.");
      return;
    }

    const [entry, err] = await deleteInventoryEntryService(parsedId);

    if (err) {
      handleErrorClient(res, 404, typeof err === 'string' ? err : err.message);
      return;
    }

    if (!entry) {
      handleErrorClient(res, 404, 'Entrada de inventario no encontrada.');
      return;
    }

    handleSuccess(res, 200, 'Entrada eliminada correctamente.', entry);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}
