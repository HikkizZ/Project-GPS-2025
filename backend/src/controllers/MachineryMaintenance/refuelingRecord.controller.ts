import { Request, Response } from 'express';
import {
  getAllRefuelingRecordsService,
  getRefuelingRecordService,
  createRefuelingRecordService,
  updateRefuelingRecordService,
  deleteRefuelingRecordService
} from '../../services/MachineryMaintenance/RefuelingRecord.service.js';

import {
  createRefuelingRecordValidation,
  updateRefuelingRecordValidation,
  refuelingQueryValidation
} from '../../validations/MachineryMaintenance/refuelingRecord.validation.js';

import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer
} from '../../handlers/responseHandlers.js';


//Solicitud de mostrar todo
export async function getRefuelingRecords(_req: Request, res: Response): Promise<void> {
  try {
    const [records, error] = await getAllRefuelingRecordsService();
    if (error || !records) {
      handleErrorClient(res, 404, error || "No se encontraron registros de repostaje.");
      return;
    }
    handleSuccess(res, 200, "Historial de repostaje obtenido correctamente.", records);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}



//Solicitud de mostrar selección
export async function getRefuelingRecord(req: Request, res: Response): Promise<void> {
  const { id } = req.query;
  const parsedId = id ? Number(id) : undefined;
  const { error } = refuelingQueryValidation.validate({ id: parsedId });

  if (error || parsedId === undefined) {
    handleErrorClient(res, 400, error?.message ?? "El parámetro 'id' es obligatorio.");
    return;
  }

  try {
    const [record, err] = await getRefuelingRecordService(parsedId);
    if (err || !record) {
      handleErrorClient(res, 404, err || "Registro no encontrado.");
      return;
    }
    handleSuccess(res, 200, "Registro de repostaje obtenido correctamente.", record);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}



//Solicitud de creación
export async function createRefuelingRecord(req: Request, res: Response): Promise<void> {
  const { error } = createRefuelingRecordValidation.validate(req.body);
  if (error) {
    handleErrorClient(res, 400, error.message);
    return;
  }

  try {
    const [created, err] = await createRefuelingRecordService(req.body);
    if (err || !created) {
      handleErrorClient(res, 400, err || "No se pudo registrar el repostaje.");
      return;
    }
    handleSuccess(res, 201, "Repostaje registrado correctamente.", created);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}



//Solicitud de actualización
export async function updateRefuelingRecord(req: Request, res: Response): Promise<void> {
  const { id } = req.query;
  const parsedId = id ? Number(id) : undefined;
  const { error: queryError } = refuelingQueryValidation.validate({ id: parsedId });

  if (queryError || parsedId === undefined) {
    handleErrorClient(res, 400, queryError?.message ?? "El parámetro 'id' es obligatorio.");
    return;
  }

  const { error: bodyError } = updateRefuelingRecordValidation.validate(req.body);
  if (bodyError) {
    handleErrorClient(res, 400, bodyError.message);
    return;
  }

  try {
    const [updated, err] = await updateRefuelingRecordService(parsedId, req.body);
    if (err || !updated) {
      handleErrorClient(res, 404, err || "No se pudo actualizar el registro de repostaje.");
      return;
    }
    handleSuccess(res, 200, "Repostaje actualizado correctamente.", updated);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}




//Solicitud de eliminación
export async function deleteRefuelingRecord(req: Request, res: Response): Promise<void> {
  const { id } = req.query;
  const parsedId = id ? Number(id) : undefined;
  const { error } = refuelingQueryValidation.validate({ id: parsedId });

  if (error || parsedId === undefined) {
    handleErrorClient(res, 400, error?.message ?? "El parámetro 'id' es obligatorio.");
    return;
  }

  try {
    const [deleted, err] = await deleteRefuelingRecordService(parsedId);
    if (err || !deleted) {
      handleErrorClient(res, 404, err || "No se pudo eliminar el registro de repostaje.");
      return;
    }
    handleSuccess(res, 200, "Repostaje eliminado correctamente.", deleted);
  } catch (error) {
    handleErrorServer(res, 500, (error as Error).message);
  }
}
