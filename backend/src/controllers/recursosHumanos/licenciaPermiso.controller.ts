import { Request, Response } from "express";
import {
  createLicenciaPermisoService,
  getAllLicenciasPermisosService,
  getLicenciaPermisoByIdService,
  updateLicenciaPermisoService,
  deleteLicenciaPermisoService,
  descargarArchivoLicenciaService,
  verificarLicenciasVencidasService
} from "../../services/recursosHumanos/licenciaPermiso.service.js";
import { User } from "../../entity/user.entity.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js";
import { LicenciaPermisoQueryValidation, CreateLicenciaPermisoValidation, UpdateLicenciaPermisoValidation } from "../../validations/recursosHumanos/licenciaPermiso.validation.js";
import { AppDataSource } from "../../config/configDB.js";
import { LicenciaPermiso } from "../../entity/recursosHumanos/licenciaPermiso.entity.js";
import path from "path";
import fs from "fs";
import { Trabajador } from "../../entity/recursosHumanos/trabajador.entity.js";
import { FileManagementService } from "../../services/fileManagement.service.js";

export async function createLicenciaPermiso(req: Request, res: Response): Promise<void> {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.user?.id) {
      handleErrorClient(res, 401, "Usuario no autenticado");
      return;
    }

    // Buscar el trabajador asociado al usuario
    const trabajadorRepo = AppDataSource.getRepository(Trabajador);
    const trabajador = await trabajadorRepo.findOne({ where: { rut: req.user.rut } });

    if (!trabajador) {
      handleErrorClient(res, 400, "Trabajador no encontrado");
      return;
    }

    // Asignar el trabajadorId encontrado
    const requestData = {
      ...req.body,
      trabajadorId: trabajador.id,
      file: req.file // Agregar archivo si existe
    };

    const validationResult = CreateLicenciaPermisoValidation.validate(requestData, { abortEarly: false });
    if (validationResult.error) {
      // Limpiar archivo en caso de error de validación
      if (req.file) {
        FileManagementService.deleteFile(req.file.path);
      }
      
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
      // Limpiar archivo en caso de error del servicio
      if (req.file) {
        FileManagementService.deleteFile(req.file.path);
      }
      
      handleErrorClient(res, 400, error as string);
      return;
    }

    handleSuccess(res, 201, "Solicitud creada exitosamente", licenciaPermiso || {});
  } catch (error) {
    // Limpiar archivo en caso de error inesperado
    if (req.file) {
      FileManagementService.deleteFile(req.file.path);
    }
    
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

export async function getMisSolicitudes(req: Request, res: Response): Promise<void> {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.user?.id) {
      handleErrorClient(res, 401, "Usuario no autenticado");
      return;
    }

    // Buscar el trabajador asociado al usuario
    const trabajadorRepo = AppDataSource.getRepository(Trabajador);
    const trabajador = await trabajadorRepo.findOne({ where: { rut: req.user.rut } });

    if (!trabajador) {
      handleErrorClient(res, 400, "Trabajador no encontrado");
      return;
    }

    // Obtener solo las solicitudes del trabajador actual
    const licenciaRepo = AppDataSource.getRepository(LicenciaPermiso);
    const misSolicitudes = await licenciaRepo.find({
      where: { trabajador: { id: trabajador.id } },
      relations: ['trabajador', 'revisadoPor'],
      order: { fechaSolicitud: 'DESC' }
    });

    handleSuccess(res, 200, "Mis solicitudes recuperadas exitosamente", misSolicitudes);
  } catch (error) {
    console.error("Error al obtener mis solicitudes:", error);
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
    if (!req.user?.id) {
      handleErrorClient(res, 401, "Usuario no autenticado");
      return;
    }

    const licenciaId = parseInt(req.params.id);
    if (isNaN(licenciaId)) {
      handleErrorClient(res, 400, "ID de licencia inválido");
      return;
    }

    const validationResult = UpdateLicenciaPermisoValidation.validate(req.body, { abortEarly: false });
    if (validationResult.error) {
      handleErrorClient(res, 400, "Error de validación", {
        errors: validationResult.error.details.map(error => ({
          field: error.path.join('.'),
          message: error.message
        }))
      });
      return;
    }

    // Buscar el usuario que está revisando la solicitud
    const userRepo = AppDataSource.getRepository(User);
    const revisadoPor = await userRepo.findOne({ where: { id: req.user.id } });

    if (!revisadoPor) {
      handleErrorClient(res, 400, "Usuario revisor no encontrado");
      return;
    }

    const updateData = {
      ...validationResult.value,
      revisadoPor
    };

    const [licenciaActualizada, error] = await updateLicenciaPermisoService(licenciaId, updateData);

    if (error) {
      handleErrorClient(res, 400, typeof error === 'string' ? error : error.message);
      return;
    }

    if (!licenciaActualizada) {
      handleErrorClient(res, 404, "No se pudo actualizar la licencia");
      return;
    }

    handleSuccess(res, 200, "Solicitud actualizada exitosamente", licenciaActualizada);
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

export async function descargarArchivoLicencia(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      handleErrorClient(res, 400, "ID inválido");
      return;
    }

    if (!req.user) {
      handleErrorClient(res, 401, "Usuario no autenticado");
      return;
    }

    const [archivoURL, error] = await descargarArchivoLicenciaService(id, req.user.rut);
    
    if (error) {
      const errorMessage = typeof error === 'string' ? error : error.message;
      const statusCode = errorMessage.includes("no encontrado") ? 404 : 
                        errorMessage.includes("permisos") ? 403 : 400;
      handleErrorClient(res, statusCode, errorMessage);
      return;
    }

    if (!archivoURL) {
      handleErrorClient(res, 404, "Archivo no encontrado");
      return;
    }

    // Obtener información del archivo para descarga
    const [fileInfo, fileError] = FileManagementService.getFileForDownload(archivoURL);
    
    if (fileError || !fileInfo) {
      handleErrorClient(res, 404, "Archivo no encontrado en el servidor");
      return;
    }

    if (!fileInfo.exists) {
      handleErrorClient(res, 404, "El archivo no existe");
      return;
    }

    // Configurar headers y enviar archivo
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.filename}"`);
    res.sendFile(require('path').resolve(fileInfo.filePath));

  } catch (error) {
    console.error("Error al descargar archivo:", error);
    handleErrorServer(res, 500, "Error interno del servidor");
  }
}

export async function verificarLicenciasVencidas(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user?.id) {
            handleErrorClient(res, 401, "Usuario no autenticado");
            return;
        }

        // Solo RRHH, Administrador o SuperAdministrador puede ejecutar la verificación
        if (req.user.role !== "RecursosHumanos" && req.user.role !== "Administrador" && req.user.role !== "SuperAdministrador") {
            handleErrorClient(res, 403, "No tiene permiso para ejecutar esta acción");
            return;
        }

        const [actualizaciones, error] = await verificarLicenciasVencidasService();

        if (error) {
            handleErrorServer(res, 500, typeof error === 'string' ? error : error.message);
            return;
        }

        handleSuccess(res, 200, `Se actualizaron ${actualizaciones} registros`, { actualizaciones });
    } catch (error) {
        console.error("Error en verificarLicenciasVencidas:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}
