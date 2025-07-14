import { Request, Response } from "express";
import {
  createMaintenanceSparePart,
  updateMaintenanceSparePart,
  deleteMaintenanceSparePart,
  getMaintenanceSparePart,
  getAllMaintenanceSpareParts
} from "../../services/MachineryMaintenance/maintenanceSparePart.service.js";

import {
  createMaintenanceSparePartValidation,
  updateMaintenanceSparePartValidation,
  maintenanceSparePartQueryValidation
} from "../../validations/MachineryMaintenance/maintenanceSparePart.validation.js";

import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer
} from "../../handlers/responseHandlers.js";



export async function createMaintenanceSpare(req: Request, res: Response): Promise<void> {
  try {
    const { error } = createMaintenanceSparePartValidation.validate(req.body);
    if (error) {
      handleErrorClient(res, 400, error.message);
      return;
    }

    const [creado, createError] = await createMaintenanceSparePart(req.body);

    if (createError) {
      const message = typeof createError === "string" ? createError : createError.message;
      handleErrorServer(res, 400, message);
      return;
    }

    handleSuccess(res, 201, "Repuesto utilizado registrado correctamente", creado!);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}

export async function updateMaintenanceSpare(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.query;
    const parsedId = id ? Number(id) : undefined;

    const { error: queryError } = maintenanceSparePartQueryValidation.validate({ id: parsedId });
    if (queryError || parsedId === undefined) {
      handleErrorClient(res, 400, queryError?.message ?? "El parámetro 'id' es obligatorio.");
      return;
    }

    const { error: bodyError } = updateMaintenanceSparePartValidation.validate(req.body);
    if (bodyError) {
      handleErrorClient(res, 400, bodyError.message);
      return;
    }

    const [updated, updateError] = await updateMaintenanceSparePart(parsedId, req.body);

    if (updateError) {
      const message = typeof updateError === "string" ? updateError : updateError.message;
      handleErrorServer(res, 404, message);
      return;
    }

    handleSuccess(res, 200, "Repuesto utilizado actualizado correctamente", updated!);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}

export async function getMaintenanceSpareParts(_req: Request, res: Response): Promise<void> {
  try {
    const [registros, error] = await getAllMaintenanceSpareParts();

    if (error) {
      const message = typeof error === "string" ? error : error.message;
      handleErrorServer(res, 404, message);
      return;
    }

    handleSuccess(res, 200, "Registros de repuestos utilizados obtenidos correctamente", registros!);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}

export async function getMaintenanceSparePartById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.query;
    const parsedId = id ? Number(id) : undefined;

    const { error } = maintenanceSparePartQueryValidation.validate({ id: parsedId });
    if (error || parsedId === undefined) {
      handleErrorClient(res, 400, error?.message ?? "El parámetro 'id' es obligatorio.");
      return;
    }

    const [registro, fetchError] = await getMaintenanceSparePart(parsedId);

    if (fetchError) {
      const message = typeof fetchError === "string" ? fetchError : fetchError.message;
      handleErrorServer(res, 404, message);
      return;
    }

    handleSuccess(res, 200, "Repuesto utilizado obtenido correctamente", registro!);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}


export async function deleteMaintenanceSpare(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.query;
    const parsedId = id ? Number(id) : undefined;

    const { error } = maintenanceSparePartQueryValidation.validate({ id: parsedId });
    if (error || parsedId === undefined) {
      handleErrorClient(res, 400, error?.message ?? "El parámetro 'id' es obligatorio.");
      return;
    }

    const [deleted, deleteError] = await deleteMaintenanceSparePart(parsedId);

    if (deleteError) {
      const message = typeof deleteError === "string" ? deleteError : deleteError.message;
      handleErrorServer(res, 404, message);
      return;
    }

    handleSuccess(res, 200, "Repuesto utilizado eliminado correctamente", deleted!);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}
