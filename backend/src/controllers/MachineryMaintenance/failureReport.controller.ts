import { Request, Response } from 'express';
import {
  createFailureReportService,
  getAllFailureReportsService,
  getFailureReportService,
  updateFailureReportService,
  deleteFailureReportService
} from '../../services/MachineryMaintenance/failureReport.service.js';

import {
  createFailureReportValidation,
  updateFailureReportValidation,
  failureQueryValidation
} from '../../validations/MachineryMaintenance/failureReport.validation.js';

import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer
} from '../../handlers/responseHandlers.js';


//Solicitud de mostrar todo
export async function getFailureReports(_req: Request, res: Response): Promise<void> {
  try {
    const [failures, error] = await getAllFailureReporstService();
    if (error || !failures) {
      handleErrorClient(res, 404, error || "No se encontraron fallos registrados.");
      return;
    }
    handleSuccess(res, 200, "Fallos obtenidos correctamente.", failures);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}

//Solicitud de mostrar selección
export async function getFailureReport(req: Request, res: Response): Promise<void> {
  const { id } = req.query;
  const parsedId = id ? Number(id) : undefined;
  const { error } = failureQueryValidation.validate({ id: parsedId });

  if (error || parsedId === undefined) {
    handleErrorClient(res, 400, error?.message ?? "El parámetro 'id' es obligatorio.");
    return;
  }

  try {
    const [failure, error] = await getFailureReportService(parsedId);
    if (error || !failure) {
      handleErrorClient(res, 404, error || "Fallo no encontrado.");
      return;
    }
    handleSuccess(res, 200, "Fallo obtenido correctamente.", failure);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}


//Solicitud de creación
export async function createFailureReport(req: Request, res: Response): Promise<void> {
  const { error } = createFailureReportValidation.validate(req.body);
  if (error) {
    handleErrorClient(res, 400, error.message);
    return;
  }

  try {
    const [created, err] = await createFailureReportService(req.body);
    if (err || !created) {
      handleErrorClient(res, 400, err || "No se pudo registrar el fallo.");
      return;
    }
    handleSuccess(res, 201, "Fallo registrado correctamente.", created);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}


//Solicitud de actualización
export async function updateFailureReport(req: Request, res: Response): Promise<void> {

  const { id } = req.query;
  const parsedId = id ? Number(id) : undefined;
  const { error: queryError } = failureQueryValidation.validate({ id: parsedId });

  if (queryError || parsedId === undefined) {
    handleErrorClient(res, 400, queryError?.message ?? "El parámetro 'id' es obligatorio.");
    return;
  }

  const { error: bodyError } = updateFailureReportValidation.validate(req.body);
  if (bodyError) {
    handleErrorClient(res, 400, bodyError.message);
    return;
  }

  try {
    const [updated, err] = await updateFailureReportService(parsedId, req.body);
    if (err || !updated) {
      handleErrorClient(res, 404, err || "No se pudo actualizar el fallo.");
      return;
    }
    handleSuccess(res, 200, "Fallo actualizado correctamente.", updated);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}




//Solicitud de eliminación
export async function deleteFailureReport(req: Request, res: Response): Promise<void> {
  const { id } = req.query;
  const parsedId = id ? Number(id) : undefined;
  const { error } = failureQueryValidation.validate({ id: parsedId });

  if (error || parsedId === undefined) {
    handleErrorClient(res, 400, error?.message ?? "El parámetro 'id' es obligatorio.");
    return;
  }

  try {
    const [deleted, err] = await deleteFailureReportService(parsedId);
    if (err || !deleted) {
      handleErrorClient(res, 404, err || "No se pudo eliminar el fallo.");
      return;
    }
    handleSuccess(res, 200, "Fallo eliminado correctamente.", deleted);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}
