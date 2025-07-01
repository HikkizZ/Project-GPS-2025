import { Request, Response } from 'express';
import {
  getAllMaintenanceHistorysService,
  getMaintenanceHistoryService,
  createMaintenanceHistoryService,
  updateMaintenanceHistoryService,
  deleteMaintenanceHistoryService
} from '../../services/MachineryMaintenance/MaintenanceHistory.service.js';

import {
  createMaintenanceHistoryValidation,
  updateMaintenanceHistoryValidation,
  maintenanceQueryValidation
} from '../../validations/MachineryMaintenance/maintenanceHistory.validation.js';

import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer
} from '../../handlers/responseHandlers.js';


//Solicitud de mostrar todo
export async function getMaintenanceHistorys(_req: Request, res: Response): Promise<void> {
  try {
    const [records, error] = await getAllMaintenanceHistorysService();
    if (error || !records) {
      handleErrorClient(res, 404, error || "No se encontraron registros de mantenciones.");
      return;
    }
    handleSuccess(res, 200, "Historial de mantenciones obtenido correctamente.", records);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}


//Solicitud de mostrar selección
export async function getMaintenance(req: Request, res: Response): Promise<void> {
  const { id } = req.query;
  const parsedId = id ? Number(id) : undefined;
  const { error } = maintenanceQueryValidation.validate({ id: parsedId });

  if (error || parsedId === undefined) {
    handleErrorClient(res, 400, error?.message ?? "El parámetro 'id' es obligatorio.");
    return;
  }

  try {
    const [record, err] = await getMaintenanceHistoryService(parsedId);
    if (err || !record) {
      handleErrorClient(res, 404, err || "Registro no encontrado.");
      return;
    }
    handleSuccess(res, 200, "Registro de mantención obtenido correctamente.", record);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}




//Solicitud de creación
export async function createMaintenanceGistory(req: Request, res: Response): Promise<void> {
  const { error } = createMaintenanceHistoryValidation.validate(req.body);
  if (error) {
    handleErrorClient(res, 400, error.message);
    return;
  }

  try {
    const [created, err] = await createMaintenanceHistoryService(req.body);
    if (err || !created) {
      handleErrorClient(res, 400, err || "No se pudo registrar la mantención.");
      return;
    }
    handleSuccess(res, 201, "Mantención registrada correctamente.", created);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}



//Solicitud de actualización
export async function updateMaintenanceHistory(req: Request, res: Response): Promise<void> {
  const { id } = req.query;
  const parsedId = id ? Number(id) : undefined;
  const { error: queryError } = maintenanceQueryValidation.validate({ id: parsedId });

  if (queryError || parsedId === undefined) {
    handleErrorClient(res, 400, queryError?.message ?? "El parámetro 'id' es obligatorio.");
    return;
  }

  const { error: bodyError } = updateMaintenanceHistoryValidation.validate(req.body);
  if (bodyError) {
    handleErrorClient(res, 400, bodyError.message);
    return;
  }

  try {
    const [updated, err] = await updateMaintenanceHistoryService(parsedId, req.body);
    if (err || !updated) {
      handleErrorClient(res, 404, err || "No se pudo actualizar la mantención.");
      return;
    }
    handleSuccess(res, 200, "Mantención actualizada correctamente.", updated);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}



//Solicitud de eliminación
export async function deleteMaintenanceHistory(req: Request, res: Response): Promise<void> {
  const { id } = req.query;
  const parsedId = id ? Number(id) : undefined;
  const { error } = maintenanceQueryValidation.validate({ id: parsedId });

  if (error || parsedId === undefined) {
    handleErrorClient(res, 400, error?.message ?? "El parámetro 'id' es obligatorio.");
    return;
  }

  try {
    const [deleted, err] = await deleteMaintenanceHistoryService(parsedId);
    if (err || !deleted) {
      handleErrorClient(res, 404, err || "No se pudo eliminar el registro de mantención.");
      return;
    }
    handleSuccess(res, 200, "Mantención eliminada correctamente.", deleted);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}
