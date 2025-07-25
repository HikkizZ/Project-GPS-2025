import { Request, Response } from 'express';
import {
  createInventoryEntryService,
  getAllInventoryEntriesService,
  getInventoryEntryByIdService,
  deleteInventoryEntryService
} from '../../services/inventory/inventoryEntry.service.js';

import { CreateInventoryEntryDTO } from '../../types/inventory/inventory.dto.js';
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

    if (err && entries === null) {
      handleErrorServer(res, 500, typeof err === 'string' ? err : err.message);
      return;
    }

    if (!entries || entries.length === 0) {
      handleSuccess(res, 200, 'No se encontraron entradas de inventario.', entries || []);
      return;
    }

    handleSuccess(res, 200, 'Entradas obtenidas correctamente.', entries);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}

export async function getInventoryEntryById(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      handleErrorClient(res, 400, "ID inválido.");
      return;
    }

    const [entry, err] = await getInventoryEntryByIdService(id);

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
    const id = Number(req.params.id);
    if (isNaN(id)) {
      handleErrorClient(res, 400, "ID inválido.");
      return;
    }

    const [entry, err] = await deleteInventoryEntryService(id);

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
