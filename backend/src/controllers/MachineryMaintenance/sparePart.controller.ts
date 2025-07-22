import { Request, Response } from "express";
import {
  createSparePart,
  updateSparePart,
  deleteSparePart,
  getSparePart,
  getAllSpareParts,
} from "../../services/MachineryMaintenance/sparePart.service.js";

import {
  createSparePartValidation,
  updateSparePartValidation,
  sparePartQueryValidation
} from "../../validations/MachineryMaintenance/sparePart.validation.js";

import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer
} from "../../handlers/responseHandlers.js";

// GET ALL
export async function getSpareParts(_req: Request, res: Response): Promise<void> {
  try {
    const [parts, error] = await getAllSpareParts();

    if (error) {
      const message = typeof error === "string" ? error : error.message;
      handleErrorServer(res, 404, message);
      return;
    }

    handleSuccess(res, 200, "Repuestos obtenidos correctamente", parts!);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}

// GET ONE
export async function getSparePartById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parsedId = id ? Number(id) : undefined;

    const { error } = sparePartQueryValidation.validate({ id: parsedId });
    if (error || parsedId === undefined) {
      handleErrorClient(res, 400, error?.message ?? "El parámetro 'id' es obligatorio.");
      return;
    }

    const [spare, fetchError] = await getSparePart(parsedId);

    if (fetchError) {
      const message = typeof fetchError === "string" ? fetchError : fetchError.message;
      handleErrorServer(res, 404, message);
      return;
    }

    handleSuccess(res, 200, "Repuesto obtenido correctamente", spare!);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}

// CREATE
export async function createSpare(req: Request, res: Response): Promise<void> {
  try {
    const { error } = createSparePartValidation.validate(req.body);

    if (error) {
      handleErrorClient(res, 400, error.message);
      return;
    }

    const [created, createError] = await createSparePart(req.body);

    if (createError) {
      const message = typeof createError === "string" ? createError : createError.message;
      handleErrorServer(res, 400, message);
      return;
    }

    handleSuccess(res, 201, "Repuesto creado correctamente", created!);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}

// UPDATE
export async function updateSpare(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parsedId = id ? Number(id) : undefined;

    const { error: queryError } = sparePartQueryValidation.validate({ id: parsedId });
    if (queryError || parsedId === undefined) {
      handleErrorClient(res, 400, queryError?.message ?? "El parámetro 'id' es obligatorio.");
      return;
    }

    const { error: bodyError } = updateSparePartValidation.validate(req.body);
    if (bodyError) {
      handleErrorClient(res, 400, bodyError.message);
      return;
    }

    const [updated, updateError] = await updateSparePart(parsedId, req.body);

    if (updateError) {
      const message = typeof updateError === "string" ? updateError : updateError.message;
      handleErrorServer(res, 404, message);
      return;
    }

    handleSuccess(res, 200, "Repuesto actualizado correctamente", updated!);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}

// DELETE
export async function deleteSpare(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parsedId = id ? Number(id) : undefined;

    const { error } = sparePartQueryValidation.validate({ id: parsedId });
    if (error || parsedId === undefined) {
      handleErrorClient(res, 400, error?.message ?? "El parámetro 'id' es obligatorio.");
      return;
    }

    const [deleted, deleteError] = await deleteSparePart(parsedId);

    if (deleteError) {
      const message = typeof deleteError === "string" ? deleteError : deleteError.message;
      handleErrorServer(res, 404, message);
      return;
    }

    handleSuccess(res, 200, "Repuesto eliminado correctamente", deleted!);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}
