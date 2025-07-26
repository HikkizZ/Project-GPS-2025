import { Request, Response } from "express";
import {
    createBonoService,
    getAllBonosService,
    getBonoByIdService,
    updateBonoService,
    deleteBonoService,
    reactivarBonoService,
    desactivarBonoService
} from "../../../services/recursosHumanos/remuneraciones/bono.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../../handlers/responseHandlers.js";
import { 
    CreateBonoValidation, 
    UpdateBonoValidation, 
    BonoQueryValidation,
    BonoReactivacionValidation
} from "../../../validations/recursosHumanos/remuneraciones/bono.validation.js";
import { AppDataSource } from "../../../config/configDB.js";
import { Trabajador } from "../../../entity/recursosHumanos/trabajador.entity.js";
import { Bono } from "../../../entity/recursosHumanos/Remuneraciones/Bono.entity.js";

/**
 * Crear una nueva bono
 */
export async function createBono(req: Request, res: Response): Promise<void> {
    try {
        // Verificar que el usuario esté autenticado
        if (!req.user?.id) {
            handleErrorClient(res, 401, "Usuario no autenticado");
            return;
        }

        // Para RRHH, pueden especificar cualquier trabajadorId

        if (req.user.role !== 'RecursosHumanos' && req.user.role !== 'SuperAdministrador') {
            handleErrorClient(res, 400, "Trabajador no encontrado");
            return;
        }

        // Preparar los datos de la solicitud
        const requestData = {
            ...req.body,
        };

        const validationResult = CreateBonoValidation.validate(requestData, { abortEarly: false });
        if (validationResult.error) {
            
            handleErrorClient(res, 400, "Error de validación", {
                errors: validationResult.error.details.map(error => ({
                    field: error.path.join('.'),
                    message: error.message
                }))
            });
            return;
        }

        const [bono, error] = await createBonoService(validationResult.value);

        if (error) {
            
            handleErrorClient(res, 400, error as string);
            return;
        }

        handleSuccess(res, 201, "Bono creado exitosamente", bono || {});
    } catch (error) {
        
        console.error("Error al crear bono:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

/**
 * Obtener todas las bonos (RRHH) o propias (Usuario)
 */
export async function getAllBonos(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user?.id) {
            handleErrorClient(res, 401, "Usuario no autenticado");
            return;
        }
        // Si no es RRHH, filtrar solo sus bonos
        if (req.user.role !== 'RecursosHumanos' && req.user.role !== 'SuperAdministrador') {
                handleErrorClient(res, 400, "Trabajador no encontrado en recursos humanos");
                return;
        }

        const [resultado, error] = await getAllBonosService();

        if (error) {
            handleErrorClient(res, 404, error as string);
            return;
        }

        handleSuccess(res, 200, "Bonos recuperadas exitosamente", resultado || { bonos: [], total: 0 });
    } catch (error) {
        console.error("Error al obtener bonos:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

/**
 * Obtener bono por ID
 */
export async function getBonoById(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user?.id) {
            handleErrorClient(res, 401, "Usuario no autenticado");
            return;
        }

        const validationResult = BonoQueryValidation.validate({ id: req.params.id }, { abortEarly: false });
        if (validationResult.error) {
            handleErrorClient(res, 400, "Error de validación", {
                errors: validationResult.error.details.map(error => ({
                    field: error.path.join('.'),
                    message: error.message
                }))
            });
            return;
        }

        const [bono, error] = await getBonoByIdService(parseInt(req.params.id));

        if (error) {
            handleErrorClient(res, 404, error as string);
            return;
        }

        // Verificar permisos: usuarios solo pueden ver sus propias bonos
        if (req.user.role !== 'RecursosHumanos' && req.user.role !== 'SuperAdministrador') {
            handleErrorClient(res, 403, "No tiene permisos para ver este bono");
            return;
        }

        handleSuccess(res, 200, "Bono recuperado exitosamente", bono || {});
    } catch (error) {
        console.error("Error al obtener bono:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

/**
 * Actualizar bono
 */
export async function updateBono(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user?.id) {
            handleErrorClient(res, 401, "Usuario no autenticado");
            return;
        }

        const bonoId = parseInt(req.params.id);
        if (isNaN(bonoId)) {
            handleErrorClient(res, 400, "ID de bono inválido");
            return;
        }

        const validationResult = UpdateBonoValidation.validate(req.body, { abortEarly: false });
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
        const [bonoExistente, errorBusqueda] = await getBonoByIdService(bonoId);
        if (errorBusqueda) {
            const errorMessage = typeof errorBusqueda === 'string' ? errorBusqueda : errorBusqueda.message;
            handleErrorClient(res, 404, errorMessage);
            return;
        }

        if (req.user.role !== 'RecursosHumanos' && req.user.role !== 'SuperAdministrador') {    
            handleErrorClient(res, 403, "No tiene permisos para actualizar esta bono");
            return;
        }

        const [bonoActualizado, error] = await updateBonoService( validationResult.value, bonoExistente?.id || bonoId);

        if (error) {
            const errorMessage = typeof error === 'string' ? error : error.message;
            handleErrorClient(res, 400, errorMessage);
            return;
        }

        handleSuccess(res, 200, "Bono actualizado exitosamente", bonoActualizado || {});
    } catch (error) {
        console.error("Error al actualizar bono:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

/**
 * Eliminar bono
 */
export async function deleteBono(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user?.id) {
            handleErrorClient(res, 401, "Usuario no autenticado");
            return;
        }

        const bonoId = parseInt(req.params.id);
        if (isNaN(bonoId)) {
            handleErrorClient(res, 400, "ID de bono inválido");
            return;
        }

        // Verificar permisos antes de eliminar
        const [bonoExistente, errorBusqueda] = await getBonoByIdService(bonoId);
        if (errorBusqueda) {
            const errorMessage = typeof errorBusqueda === 'string' ? errorBusqueda : errorBusqueda.message;
            handleErrorClient(res, 404, errorMessage);
            return;
        }

        if (req.user.role !== 'RecursosHumanos' && req.user.role !== 'SuperAdministrador') {
            handleErrorClient(res, 403, "No tiene permisos para eliminar este bono");
            return;
        }

        const [bonoEliminado, error] = await deleteBonoService(bonoExistente?.id || bonoId);

        if (error) {
            const errorMessage = typeof error === 'string' ? error : error.message;
            handleErrorClient(res, 404, errorMessage);
            return;
        }

        handleSuccess(res, 200, "Bono eliminado exitosamente", bonoEliminado || {});
    } catch (error) {
        console.error("Error al eliminar bono:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

/**
 * Reactivar bono
 */
export async function reactivarBono(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!id) {
            handleErrorClient(res, 400, "ID es requerido");
            return;
        }

        const idNumber = parseInt(id);
        if (isNaN(idNumber)) {
            handleErrorClient(res, 400, "ID inválido");
            return;
        }

        if (!userId) {
            handleErrorClient(res, 401, "Usuario no autenticado");
            return;
        }

        // Validar datos del body
        const validationResult = BonoReactivacionValidation.validate(req.body);
        if (validationResult.error) {
            handleErrorClient(res, 400, validationResult.error.message);
            return;
        }

        const [bonoReactivado, error] = await reactivarBonoService(idNumber, req.body);

        if (error) {
            const errorMessage = typeof error === 'string' ? error : error.message || "No se pudo reactivar el bono";
            handleErrorClient(res, 400, errorMessage);
            return;
        }

        if (!bonoReactivado) {
            handleErrorClient(res, 404, "Bono no encontrado o no se pudo reactivar");
            return;
        }
        handleSuccess(res, 200, "Bono reactivado exitosamente", bonoReactivado || {});
    } catch (error) {
        console.error("Error al reactivar bono:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}
/**
 * Desactivar bono
 */
export async function desactivarBono(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user?.id) {
            handleErrorClient(res, 401, "Usuario no autenticado");
            return;
        }

        const bonoId = parseInt(req.params.id);
        if (isNaN(bonoId)) {
            handleErrorClient(res, 400, "ID de bono inválido");
            return;
        }

        let motivo = req.body.motivo;
        if (!motivo || typeof motivo !== 'string' || motivo.trim() === '') {
            handleErrorClient(res, 400, "Motivo de desactivación inválido");
            return;
        }

        const [bono, errorDesactivar] = await desactivarBonoService(bonoId, motivo.trim());

        if (errorDesactivar) {
            const errorMessage = typeof errorDesactivar === 'string' ? errorDesactivar : errorDesactivar.message;
            if (errorMessage.includes("No tiene permiso")){
                handleErrorClient(res, 403, errorMessage);
                return;
            }
            if (errorMessage.includes("no encontrado")) {
                handleErrorClient(res, 404, errorMessage);
                return;
            }
            handleErrorClient(res, 400, errorMessage);
            return;
        }

        if (!bono) {
            handleErrorClient(res, 404, "Bono no se pudo desactivar");
        }

        handleSuccess(res, 200, "Bono desactivado exitosamente", bono || {});
    } catch (error) {
        console.error("Error al desactivar bono:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}
