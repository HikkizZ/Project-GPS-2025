import { Request, Response } from "express";
import {
  createLicenciaPermisoService,
  getAllLicenciasPermisosService,
  getLicenciaPermisoByIdService,
  updateLicenciaPermisoService,
  deleteLicenciaPermisoService
} from "../../services/recursosHumanos/licenciaPermiso.service.js";
import { User } from "../../entity/user.entity.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js";
import { LicenciaPermisoQueryValidation, CreateLicenciaPermisoValidation, UpdateLicenciaPermisoValidation } from "../../validations/recursosHumanos/licenciaPermiso.validation.js";

export async function createLicenciaPermiso(req: Request, res: Response): Promise<void> {
  try {
    const validationResult = CreateLicenciaPermisoValidation.validate(req.body, { abortEarly: false });
    if (validationResult.error) {
      handleErrorClient(res, 400, "Error de validación", {
        errors: validationResult.error.details.map(error => ({
          field: error.path.join('.'),
          message: error.message
        }))
      });
      return;
    }

    const [licenciaPermiso, error] = await createLicenciaPermisoService(validationResult.value);

    if (error) {
      handleErrorClient(res, 400, error as string);
      return;
    }

    handleSuccess(res, 201, "Solicitud creada exitosamente", licenciaPermiso || {});
  } catch (error) {
    console.error("Error al crear licencia/permiso:", error);
    handleErrorServer(res, 500, "Error interno del servidor");
  }
}

export async function getAllLicenciasPermisos(req: Request, res: Response): Promise<void> {
  try {
    // Validar query params si existen
    if (Object.keys(req.query).length > 0) {
      const validationResult = LicenciaPermisoQueryValidation.validate(req.query, { abortEarly: false });
      if (validationResult.error) {
        handleErrorClient(res, 400, "Error de validación", {
          errors: validationResult.error.details.map(error => ({
            field: error.path.join('.'),
            message: error.message
          }))
        });
        return;
      }
    }

    const [licenciasPermisos, error] = await getAllLicenciasPermisosService();

    if (error) {
      handleErrorClient(res, 404, error as string);
      return;
    }

    handleSuccess(res, 200, "Solicitudes recuperadas exitosamente", licenciasPermisos || {});
  } catch (error) {
    console.error("Error al obtener licencias/permisos:", error);
    handleErrorServer(res, 500, "Error interno del servidor");
  }
}

export async function getLicenciaPermisoById(req: Request, res: Response): Promise<void> {
  try {
    const validationResult = LicenciaPermisoQueryValidation.validate({ id: req.params.id }, { abortEarly: false });
    if (validationResult.error) {
      handleErrorClient(res, 400, "Error de validación", {
        errors: validationResult.error.details.map(error => ({
          field: error.path.join('.'),
          message: error.message
        }))
      });
      return;
    }

    const [licenciaPermiso, error] = await getLicenciaPermisoByIdService(parseInt(req.params.id));

    if (error) {
      handleErrorClient(res, 404, error as string);
      return;
    }

    handleSuccess(res, 200, "Solicitud recuperada exitosamente", licenciaPermiso || {});
  } catch (error) {
    console.error("Error al obtener licencia/permiso:", error);
    handleErrorServer(res, 500, "Error interno del servidor");
  }
}

export async function updateLicenciaPermiso(req: Request, res: Response): Promise<void> {
  try {
    // Validar ID
    const idValidation = LicenciaPermisoQueryValidation.validate({ id: req.params.id }, { abortEarly: false });
    if (idValidation.error) {
      handleErrorClient(res, 400, "Error de validación", {
        errors: idValidation.error.details.map(error => ({
          field: error.path.join('.'),
          message: error.message
        }))
      });
      return;
    }

    // Validar body
    const bodyValidation = UpdateLicenciaPermisoValidation.validate(req.body, { abortEarly: false });
    if (bodyValidation.error) {
      handleErrorClient(res, 400, "Error de validación", {
        errors: bodyValidation.error.details.map(error => ({
          field: error.path.join('.'),
          message: error.message
        }))
      });
      return;
    }

    // Obtener el usuario que está realizando la actualización (desde el middleware de autenticación)
    const user = req.user as User;
    if (!user) {
      handleErrorClient(res, 401, "Usuario no autenticado");
      return;
    }

    const updateData = {
      ...bodyValidation.value,
      revisadoPor: user
    };

    const [licenciaPermiso, error] = await updateLicenciaPermisoService(parseInt(req.params.id), updateData);

    if (error) {
      handleErrorClient(res, 404, error as string);
      return;
    }

    handleSuccess(res, 200, "Solicitud actualizada exitosamente", licenciaPermiso || {});
  } catch (error) {
    console.error("Error al actualizar licencia/permiso:", error);
    handleErrorServer(res, 500, "Error interno del servidor");
  }
}

export async function deleteLicenciaPermiso(req: Request, res: Response): Promise<void> {
  try {
    const validationResult = LicenciaPermisoQueryValidation.validate({ id: req.params.id }, { abortEarly: false });
    if (validationResult.error) {
      handleErrorClient(res, 400, "Error de validación", {
        errors: validationResult.error.details.map(error => ({
          field: error.path.join('.'),
          message: error.message
        }))
      });
      return;
    }

    const [licenciaPermiso, error] = await deleteLicenciaPermisoService(parseInt(req.params.id));

    if (error) {
      handleErrorClient(res, 404, error as string);
      return;
    }

    handleSuccess(res, 200, "Solicitud eliminada exitosamente", licenciaPermiso || {});
  } catch (error) {
    console.error("Error al eliminar licencia/permiso:", error);
    handleErrorServer(res, 500, "Error interno del servidor");
  }
}
