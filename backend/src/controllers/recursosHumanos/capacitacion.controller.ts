import { Request, Response } from "express";
import {
    createCapacitacionService,
    getAllCapacitacionesService,
    getCapacitacionByIdService,
    getCapacitacionesByTrabajadorService,
    updateCapacitacionService,
    deleteCapacitacionService,
    descargarCertificadoService
} from "../../services/recursosHumanos/capacitacion.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js";
import { 
    CreateCapacitacionValidation, 
    UpdateCapacitacionValidation, 
    CapacitacionQueryValidation 
} from "../../validations/recursosHumanos/capacitacion.validation.js";
import { AppDataSource } from "../../config/configDB.js";
import { Trabajador } from "../../entity/recursosHumanos/trabajador.entity.js";
import { FileManagementService } from "../../services/fileManagement.service.js";

/**
 * Crear una nueva capacitación
 */
export async function createCapacitacion(req: Request, res: Response): Promise<void> {
    try {
        // Verificar que el usuario esté autenticado
        if (!req.user?.id) {
            handleErrorClient(res, 401, "Usuario no autenticado");
            return;
        }

        // Para usuarios normales, buscar su trabajador asociado
        // Para RRHH, pueden especificar cualquier trabajadorId
        let trabajadorId = req.body.trabajadorId;

        if (req.user.role !== 'RecursosHumanos') {
            // Buscar el trabajador asociado al usuario
            const trabajadorRepo = AppDataSource.getRepository(Trabajador);
            const trabajador = await trabajadorRepo.findOne({ where: { rut: req.user.rut } });

            if (!trabajador) {
                handleErrorClient(res, 400, "Trabajador no encontrado");
                return;
            }
            trabajadorId = trabajador.id;
        }

        // Preparar los datos de la solicitud
        const requestData = {
            ...req.body,
            trabajadorId: trabajadorId,
            file: req.file // Agregar archivo si existe
        };

        const validationResult = CreateCapacitacionValidation.validate(requestData, { abortEarly: false });
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

        const [capacitacion, error] = await createCapacitacionService(validationResult.value);

        if (error) {
            // Limpiar archivo en caso de error del servicio
            if (req.file) {
                FileManagementService.deleteFile(req.file.path);
            }
            
            handleErrorClient(res, 400, error as string);
            return;
        }

        handleSuccess(res, 201, "Capacitación creada exitosamente", capacitacion || {});
    } catch (error) {
        // Limpiar archivo en caso de error inesperado
        if (req.file) {
            FileManagementService.deleteFile(req.file.path);
        }
        
        console.error("Error al crear capacitación:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

/**
 * Obtener todas las capacitaciones (RRHH) o propias (Usuario)
 */
export async function getAllCapacitaciones(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user?.id) {
            handleErrorClient(res, 401, "Usuario no autenticado");
            return;
        }

        // Validar query params si existen
        const validationResult = CapacitacionQueryValidation.validate(req.query, { abortEarly: false });
        if (validationResult.error) {
            handleErrorClient(res, 400, "Error de validación", {
                errors: validationResult.error.details.map(error => ({
                    field: error.path.join('.'),
                    message: error.message
                }))
            });
            return;
        }

        const query = validationResult.value;

        // Si no es RRHH, filtrar solo sus capacitaciones
        if (req.user.role !== 'RecursosHumanos') {
            const trabajadorRepo = AppDataSource.getRepository(Trabajador);
            const trabajador = await trabajadorRepo.findOne({ where: { rut: req.user.rut } });

            if (!trabajador) {
                handleErrorClient(res, 400, "Trabajador no encontrado");
                return;
            }

            query.trabajadorId = trabajador.id;
        }

        const [resultado, error] = await getAllCapacitacionesService(query);

        if (error) {
            handleErrorClient(res, 404, error as string);
            return;
        }

        handleSuccess(res, 200, "Capacitaciones recuperadas exitosamente", resultado || {});
    } catch (error) {
        console.error("Error al obtener capacitaciones:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

/**
 * Obtener capacitación por ID
 */
export async function getCapacitacionById(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user?.id) {
            handleErrorClient(res, 401, "Usuario no autenticado");
            return;
        }

        const validationResult = CapacitacionQueryValidation.validate({ id: req.params.id }, { abortEarly: false });
        if (validationResult.error) {
            handleErrorClient(res, 400, "Error de validación", {
                errors: validationResult.error.details.map(error => ({
                    field: error.path.join('.'),
                    message: error.message
                }))
            });
            return;
        }

        const [capacitacion, error] = await getCapacitacionByIdService(parseInt(req.params.id));

        if (error) {
            handleErrorClient(res, 404, error as string);
            return;
        }

        // Verificar permisos: usuarios solo pueden ver sus propias capacitaciones
        if (req.user.role !== 'RecursosHumanos' && req.user.role !== 'Administrador') {
            const trabajadorRepo = AppDataSource.getRepository(Trabajador);
            const trabajador = await trabajadorRepo.findOne({ where: { rut: req.user.rut } });

            if (!trabajador || capacitacion!.trabajador.id !== trabajador.id) {
                handleErrorClient(res, 403, "No tiene permisos para ver esta capacitación");
                return;
            }
        }

        handleSuccess(res, 200, "Capacitación recuperada exitosamente", capacitacion || {});
    } catch (error) {
        console.error("Error al obtener capacitación:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

/**
 * Obtener capacitaciones de un trabajador específico
 */
export async function getCapacitacionesByTrabajador(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user?.id) {
            handleErrorClient(res, 401, "Usuario no autenticado");
            return;
        }

        const trabajadorId = parseInt(req.params.trabajadorId);
        if (isNaN(trabajadorId)) {
            handleErrorClient(res, 400, "ID de trabajador inválido");
            return;
        }

        // Verificar permisos
        if (req.user.role !== 'RecursosHumanos' && req.user.role !== 'Administrador') {
            const trabajadorRepo = AppDataSource.getRepository(Trabajador);
            const trabajador = await trabajadorRepo.findOne({ where: { rut: req.user.rut } });

            if (!trabajador || trabajador.id !== trabajadorId) {
                handleErrorClient(res, 403, "No tiene permisos para ver estas capacitaciones");
                return;
            }
        }

        const [capacitaciones, error] = await getCapacitacionesByTrabajadorService(trabajadorId);

        if (error) {
            handleErrorClient(res, 404, error as string);
            return;
        }

        handleSuccess(res, 200, "Capacitaciones del trabajador recuperadas exitosamente", capacitaciones || []);
    } catch (error) {
        console.error("Error al obtener capacitaciones del trabajador:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

/**
 * Actualizar capacitación
 */
export async function updateCapacitacion(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user?.id) {
            handleErrorClient(res, 401, "Usuario no autenticado");
            return;
        }

        const capacitacionId = parseInt(req.params.id);
        if (isNaN(capacitacionId)) {
            handleErrorClient(res, 400, "ID de capacitación inválido");
            return;
        }

        const validationResult = UpdateCapacitacionValidation.validate(req.body, { abortEarly: false });
        if (validationResult.error) {
            handleErrorClient(res, 400, "Error de validación", {
                errors: validationResult.error.details.map(error => ({
                    field: error.path.join('.'),
                    message: error.message
                }))
            });
            return;
        }

        // Verificar permisos antes de actualizar
        const [capacitacionExistente, errorBusqueda] = await getCapacitacionByIdService(capacitacionId);
        if (errorBusqueda) {
            handleErrorClient(res, 404, errorBusqueda);
            return;
        }

        if (req.user.role !== 'RecursosHumanos' && req.user.role !== 'Administrador') {
            const trabajadorRepo = AppDataSource.getRepository(Trabajador);
            const trabajador = await trabajadorRepo.findOne({ where: { rut: req.user.rut } });

            if (!trabajador || capacitacionExistente!.trabajador.id !== trabajador.id) {
                handleErrorClient(res, 403, "No tiene permisos para actualizar esta capacitación");
                return;
            }
        }

        const [capacitacionActualizada, error] = await updateCapacitacionService(capacitacionId, validationResult.value);

        if (error) {
            handleErrorClient(res, 400, error);
            return;
        }

        handleSuccess(res, 200, "Capacitación actualizada exitosamente", capacitacionActualizada || {});
    } catch (error) {
        console.error("Error al actualizar capacitación:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

/**
 * Eliminar capacitación
 */
export async function deleteCapacitacion(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user?.id) {
            handleErrorClient(res, 401, "Usuario no autenticado");
            return;
        }

        const capacitacionId = parseInt(req.params.id);
        if (isNaN(capacitacionId)) {
            handleErrorClient(res, 400, "ID de capacitación inválido");
            return;
        }

        // Verificar permisos antes de eliminar
        const [capacitacionExistente, errorBusqueda] = await getCapacitacionByIdService(capacitacionId);
        if (errorBusqueda) {
            handleErrorClient(res, 404, errorBusqueda);
            return;
        }

        if (req.user.role !== 'RecursosHumanos' && req.user.role !== 'Administrador') {
            const trabajadorRepo = AppDataSource.getRepository(Trabajador);
            const trabajador = await trabajadorRepo.findOne({ where: { rut: req.user.rut } });

            if (!trabajador || capacitacionExistente!.trabajador.id !== trabajador.id) {
                handleErrorClient(res, 403, "No tiene permisos para eliminar esta capacitación");
                return;
            }
        }

        const [capacitacionEliminada, error] = await deleteCapacitacionService(capacitacionId);

        if (error) {
            handleErrorClient(res, 404, error as string);
            return;
        }

        handleSuccess(res, 200, "Capacitación eliminada exitosamente", capacitacionEliminada || {});
    } catch (error) {
        console.error("Error al eliminar capacitación:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

/**
 * Descargar certificado de capacitación
 */
export async function descargarCertificado(req: Request, res: Response): Promise<void> {
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

        const [certificadoURL, error] = await descargarCertificadoService(id, req.user.rut);
        
        if (error) {
            const statusCode = error.includes("no encontrado") ? 404 : 
                            error.includes("permisos") ? 403 : 400;
            handleErrorClient(res, statusCode, error);
            return;
        }

        if (!certificadoURL) {
            handleErrorClient(res, 404, "Certificado no encontrado");
            return;
        }

        // Obtener información del archivo para descarga
        const [fileInfo, fileError] = FileManagementService.getFileForDownload(certificadoURL);
        
        if (fileError || !fileInfo) {
            handleErrorClient(res, 404, "Certificado no encontrado en el servidor");
            return;
        }

        if (!fileInfo.exists) {
            handleErrorClient(res, 404, "El certificado no existe");
            return;
        }

        // Configurar headers y enviar archivo
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.filename}"`);
        res.sendFile(require('path').resolve(fileInfo.filePath));

    } catch (error) {
        console.error("Error al descargar certificado:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
} 