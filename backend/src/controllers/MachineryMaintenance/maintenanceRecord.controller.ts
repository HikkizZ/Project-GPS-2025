import { Request, Response } from "express";
import {
  createMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
  getMaintenanceRecordById,
  getAllMaintenanceRecords,
} from "../../services/MachineryMaintenance/maintenanceRecord.service.js";

import {
  createMaintenanceRecordValidation,
  updateMaintenanceRecordValidation,
  maintenanceRecordQueryValidation,
} from "../../validations/MachineryMaintenance/maintenanceRecord.validation.js";

import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../../handlers/responseHandlers.js";

export async function getMaintenanceRecords(_req: Request, res: Response): Promise<void> {
  try {
    const [records, error] = await getAllMaintenanceRecords();

    if (error) {
      const message = typeof error === "string" ? error : error.message;
      handleErrorServer(res, 404, message);
      return;
    }

    handleSuccess(res, 200, "Mantenciones obtenidas correctamente", records!);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}


export async function getMaintenanceRecord(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parsedId = Number(id);

    const { error } = maintenanceRecordQueryValidation.validate({ id: parsedId });
    if (error || isNaN(parsedId)) {
      handleErrorClient(res, 400, error?.message ?? "El parámetro 'id' es obligatorio");
      return;
    }

    const [record, recordError] = await getMaintenanceRecordById(parsedId);

    if (recordError) {
      const message = typeof recordError === "string" ? recordError : recordError.message;
      handleErrorServer(res, 404, message);
      return;
    }

    handleSuccess(res, 200, "Mantención obtenida correctamente", record!);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}



export async function createMaintenance(req: Request, res: Response): Promise<void> {
  try {
    const { error } = createMaintenanceRecordValidation.validate(req.body);
    if (error) {
      handleErrorClient(res, 400, error.message);
      return;
    }

    const [created, createError] = await createMaintenanceRecord(req.body);

    if (createError) {
      const message = typeof createError === "string" ? createError : createError.message;
      handleErrorServer(res, 400, message);
      return;
    }

    handleSuccess(res, 201, "Mantención registrada correctamente", created!);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}


export async function updateMaintenance(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parsedId = Number(id);

    const { error: queryError } = maintenanceRecordQueryValidation.validate({ id: parsedId });
    if (queryError || isNaN(parsedId)) {
      handleErrorClient(res, 400, queryError?.message ?? "El parámetro 'id' es obligatorio");
      return;
    }

    const { error: bodyError } = updateMaintenanceRecordValidation.validate(req.body);
    if (bodyError) {
      handleErrorClient(res, 400, bodyError.message);
      return;
    }

    const [updated, updateError] = await updateMaintenanceRecord(parsedId, req.body);

    if (updateError) {
      const message = typeof updateError === "string" ? updateError : updateError.message;
      handleErrorServer(res, 404, message);
      return;
    }

    handleSuccess(res, 200, "Mantención actualizada correctamente", updated!);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}



export async function deleteMaintenance(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parsedId = id ? Number(id) : undefined;

    const { error } = maintenanceRecordQueryValidation.validate({ id: parsedId });
    if (error || parsedId === undefined) {
      handleErrorClient(res, 400, error?.message ?? "El parámetro 'id' es obligatorio");
      return;
    }

    const [deleted, deleteError] = await deleteMaintenanceRecord(parsedId);

    if (deleteError) {
      const message = typeof deleteError === "string" ? deleteError : deleteError.message;
      handleErrorServer(res, 404, message);
      return;
    }

    handleSuccess(res, 200, "Mantención eliminada correctamente", deleted!);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}
