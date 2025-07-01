import { Request, Response } from 'express';
import {
  getAllSparePartsService,
  getSparePartService,
  createSparePartService,
  updateSparePartService,
  deleteSparePartService
} from '../../services/MachineryMaintenance/SparePart.service.js';

import {
  createSparePartValidation,
  updateSparePartValidation,
  sparePartQueryValidation
} from '../../validations/MachineryMaintenance/sparePart.validation.js';

import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer
} from '../../handlers/responseHandlers.js';


//Solicitud de mostrar todo
export async function getSpareParts(_req: Request, res: Response): Promise<void> {
  try {
    const [records, error] = await getAllSparePartsService();
    if (error || !records) {
      handleErrorClient(res, 404, error || "No se encontraron repuestos.");
      return;
    }
    handleSuccess(res, 200, "Repuestos obtenidos correctamente.", records);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}


//Solicitud de mostrar selección
export async function getSparePart(req: Request, res: Response): Promise<void> {
  const { id } = req.query;
  const parsedId = id ? Number(id) : undefined;
  const { error } = sparePartQueryValidation.validate({ id: parsedId });

  if (error || parsedId === undefined) {
    handleErrorClient(res, 400, error?.message ?? "El parámetro 'id' es obligatorio.");
    return;
  }

  try {
    const [record, err] = await getSparePartService(parsedId);
    if (err || !record) {
      handleErrorClient(res, 404, err || "Repuesto no encontrado.");
      return;
    }
    handleSuccess(res, 200, "Repuesto obtenido correctamente.", record);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}



//Solicitud de creación
export async function createSparePart(req: Request, res: Response): Promise<void> {
  const { error } = createSparePartValidation.validate(req.body);
  if (error) {
    handleErrorClient(res, 400, error.message);
    return;
  }

  try {
    const [created, err] = await createSparePartService(req.body);
    if (err || !created) {
      handleErrorClient(res, 400, err || "No se pudo registrar el repuesto.");
      return;
    }
    handleSuccess(res, 201, "Repuesto registrado correctamente.", created);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}


//Solicitud de actualización
export async function updateSparePart(req: Request, res: Response): Promise<void> {
  const { id } = req.query;
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

  try {
    const [updated, err] = await updateSparePartService(parsedId, req.body);
    if (err || !updated) {
      handleErrorClient(res, 404, err || "No se pudo actualizar el repuesto.");
      return;
    }
    handleSuccess(res, 200, "Repuesto actualizado correctamente.", updated);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}


//Solicitud de eliminación
export async function deleteSparePart(req: Request, res: Response): Promise<void> {
  const { id } = req.query;
  const parsedId = id ? Number(id) : undefined;
  const { error } = sparePartQueryValidation.validate({ id: parsedId });

  if (error || parsedId === undefined) {
    handleErrorClient(res, 400, error?.message ?? "El parámetro 'id' es obligatorio.");
    return;
  }

  try {
    const [deleted, err] = await deleteSparePartService(parsedId);
    if (err || !deleted) {
      handleErrorClient(res, 404, err || "No se pudo eliminar el repuesto.");
      return;
    }
    handleSuccess(res, 200, "Repuesto eliminado correctamente.", deleted);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}
