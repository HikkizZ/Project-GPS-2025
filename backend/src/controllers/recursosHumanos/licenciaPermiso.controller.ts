import { Request, Response } from "express";
import {
  createLicenciaPermisoService,
  getAllLicenciasPermisosService,
  getLicenciaPermisoByIdService,
  updateLicenciaPermisoService,
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

    // Validar que el Super Administrador no pueda crear solicitudes (es un usuario ficticio)
    if (req.user.role === 'SuperAdministrador') {
      handleErrorClient(res, 403, "Los Super Administradores no pueden crear solicitudes de licencias o permisos");
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
      handleErrorClient(res, 400, error as string);
      return;
    }

    // Si no hay licencias, devolver array vacío con mensaje amigable
    const licenciasData = licenciasPermisos || [];
    const mensaje = licenciasData.length === 0 
      ? "No hay solicitudes registradas en el sistema" 
      : "Solicitudes recuperadas exitosamente";

    handleSuccess(res, 200, mensaje, licenciasData);
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

    // Validar que el Super Administrador no pueda acceder a solicitudes personales (es un usuario ficticio)
    if (req.user.role === 'SuperAdministrador') {
      handleErrorClient(res, 403, "Los Super Administradores no tienen solicitudes personales");
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

    // Si no hay solicitudes, devolver array vacío con mensaje amigable
    const mensaje = misSolicitudes.length === 0 
      ? "No tienes solicitudes registradas" 
      : "Mis solicitudes recuperadas exitosamente";

    handleSuccess(res, 200, mensaje, misSolicitudes);
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

    // Buscar la solicitud para verificar quién es el solicitante
    const licenciaRepo = AppDataSource.getRepository(LicenciaPermiso);
    const solicitudExistente = await licenciaRepo.findOne({
      where: { id: licenciaId },
      relations: ["trabajador"]
    });

    if (!solicitudExistente) {
      handleErrorClient(res, 404, "Solicitud no encontrada");
      return;
    }

    // Validar que el usuario no puede aprobar/rechazar su propia solicitud
    if (solicitudExistente.trabajador.rut === req.user.rut) {
      handleErrorClient(res, 403, "No puede aprobar o rechazar su propia solicitud. Esta acción debe ser realizada por otro usuario con permisos adecuados");
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

    const [result, error] = await descargarArchivoLicenciaService(id, req.user.rut);
    
    if (error) {
      const errorMessage = typeof error === 'string' ? error : error.message;
      const statusCode = errorMessage.includes("no encontrado") ? 404 : 
                        errorMessage.includes("permisos") ? 403 : 400;
      handleErrorClient(res, statusCode, errorMessage);
      return;
    }

    if (!result || !result.filePath) {
      handleErrorClient(res, 404, "Archivo no encontrado");
      return;
    }

    const { filePath, customFilename } = result;
    
    // Validar que el nombre personalizado es válido
    if (!customFilename || customFilename.trim() === '' || customFilename === 'undefined' || customFilename === 'null') {
      const fallbackName = `Licencia_${id}.pdf`;
      
      // Configurar headers para evitar cache y forzar descarga ANTES de res.download
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fallbackName}"`);
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
      
      res.download(filePath, fallbackName, (err) => {
        if (err && !res.headersSent) {
          handleErrorServer(res, 500, "No se pudo descargar el archivo.");
        }
      });
      return;
    }

    // Verificar que el archivo existe antes de intentar enviarlo
    if (!fs.existsSync(filePath)) {
      handleErrorClient(res, 404, "El archivo del certificado no se encuentra en el servidor");
      return;
    }

    // Configurar headers para evitar cache y forzar descarga ANTES de res.download
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${customFilename}"`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

    // Enviar archivo con nombre personalizado
    res.download(filePath, customFilename, (err) => {
      if (err && !res.headersSent) {
        handleErrorServer(res, 500, "No se pudo descargar el archivo.");
      }
    });

  } catch (error) {
    console.error("Error en descargarArchivoLicencia:", error);
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
