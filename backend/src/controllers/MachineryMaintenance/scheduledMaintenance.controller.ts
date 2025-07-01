import { Request, Response } from 'express';
import {
  getAllScheduledMaintenancesService,
  getScheduledMaintenanceService,
  createScheduledMaintenanceService,
  updateScheduledMaintenanceService,
  deleteScheduledMaintenanceService
} from '../../services/MachineryMaintenance/ScheduledMaintenance.service.js';

import {
  createScheduledMaintenanceValidation,
  updateScheduledMaintenanceValidation,
  scheduledMaintenanceQueryValidation
} from '../../validations/MachineryMaintenance/scheduledMaintenance.validation.js';

import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer
} from '../../handlers/responseHandlers.js';



//Solicitud de mostrar todo
export async function getScheduledMaintenances(_req: Request, res: Response): Promise<void> {
  try {
    const [records, error] = await getAllScheduledMaintenancesService();
    if (error || !records) {
      handleErrorClient(res, 404, error || "No se encontraron mantenciones programadas.");
      return;
    }
    handleSuccess(res, 200, "Mantenciones programadas obtenidas correctamente.", records);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}



//Solicitud de mostrar selección
export async function getScheduledMaintenance(req: Request, res: Response): Promise<void> {
  const { id } = req.query;
  const parsedId = id ? Number(id) : undefined;
  const { error } = scheduledMaintenanceQueryValidation.validate({ id: parsedId });

  if (error || parsedId === undefined) {
    handleErrorClient(res, 400, error?.message ?? "El parámetro 'id' es obligatorio.");
    return;
  }

  try {
    const [record, err] = await getScheduledMaintenanceService(parsedId);
    if (err || !record) {
      handleErrorClient(res, 404, err || "Registro no encontrado.");
      return;
    }
    handleSuccess(res, 200, "Registro de mantención programada obtenido correctamente.", record);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}



//Solicitud de creación
export async function createScheduledMaintenance(req: Request, res: Response): Promise<void> {
  const { error } = createScheduledMaintenanceValidation.validate(req.body);
  if (error) {
    handleErrorClient(res, 400, error.message);
    return;
  }

  try {
    const [created, err] = await createScheduledMaintenanceService(req.body);
    if (err || !created) {
      handleErrorClient(res, 400, err || "No se pudo registrar la mantención programada.");
      return;
    }
    handleSuccess(res, 201, "Mantención programada registrada correctamente.", created);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}



//Solicitud de actualización
export async function updateScheduledMaintenance(req: Request, res: Response): Promise<void> {
  const { id } = req.query;
  const parsedId = id ? Number(id) : undefined;
  const { error: queryError } = scheduledMaintenanceQueryValidation.validate({ id: parsedId });

  if (queryError || parsedId === undefined) {
    handleErrorClient(res, 400, queryError?.message ?? "El parámetro 'id' es obligatorio.");
    return;
  }

  const { error: bodyError } = updateScheduledMaintenanceValidation.validate(req.body);
  if (bodyError) {
    handleErrorClient(res, 400, bodyError.message);
    return;
  }

  try {
    const [updated, err] = await updateScheduledMaintenanceService(parsedId, req.body);
    if (err || !updated) {
      handleErrorClient(res, 404, err || "No se pudo actualizar la mantención programada.");
      return;
    }
    handleSuccess(res, 200, "Mantención programada actualizada correctamente.", updated);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}



//Solicitud de eliminación
export async function deleteScheduledMaintenance(req: Request, res: Response): Promise<void> {
  const { id } = req.query;
  const parsedId = id ? Number(id) : undefined;
  const { error } = scheduledMaintenanceQueryValidation.validate({ id: parsedId });

  if (error || parsedId === undefined) {
    handleErrorClient(res, 400, error?.message ?? "El parámetro 'id' es obligatorio.");
    return;
  }

  try {
    const [deleted, err] = await deleteScheduledMaintenanceService(parsedId);
    if (err || !deleted) {
      handleErrorClient(res, 404, err || "No se pudo eliminar la mantención programada.");
      return;
    }
    handleSuccess(res, 200, "Mantención programada eliminada correctamente.", deleted);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}
