import { Request, Response } from "express";
import {
    createBonoService,
    getAllBonosService,
    getBonoByIdService,
    updateBonoService,
    deleteBonoService,
    assignBonoService,
    updateAssingBonoService
} from "../../../services/recursosHumanos/remuneraciones/bono.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../../handlers/responseHandlers.js";
import { 
    CreateBonoValidation, 
    UpdateBonoValidation, 
    BonoQueryValidation ,
    AsignarBonoValidation
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

        // Validar query params si existen
        const validationResult = BonoQueryValidation.validate(req.query, { abortEarly: false });
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

        // Si no es RRHH, filtrar solo sus bonos
        if (req.user.role !== 'RecursosHumanos' && req.user.role !== 'SuperAdministrador') {
                handleErrorClient(res, 400, "Trabajador no encontrado en recursos humanos");
                return;
        }

        const [resultado, error] = await getAllBonosService(query);

        if (error) {
            handleErrorClient(res, 404, error as string);
            return;
        }

        handleSuccess(res, 200, "Bonos recuperadas exitosamente", resultado || {});
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

export async function asignarBono(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user?.id) {
            handleErrorClient(res, 401, "Usuario no autenticado");
            return;
        }
        // Validar que el usuario sea RRHH o SuperAdministrador
        if (req.user.role !== 'RecursosHumanos' && req.user.role !== 'SuperAdministrador') {
            handleErrorClient(res, 403, "No tiene permisos para asignar bonos");
            return;
        }

        // Preparar los datos de la solicitud
        const requestData = {
            ...req.body,
        };

        // Validar el cuerpo de la solicitud
        const validationResult = AsignarBonoValidation.validate(requestData, { abortEarly: false });
        if (validationResult.error) {
            
            handleErrorClient(res, 400, "Error de validación", {
                errors: validationResult.error.details.map(error => ({
                    field: error.path.join('.'),
                    message: error.message
                }))
            });
            return;
        }
        
        // Asignar el bono al trabajador
        const [ asignacionBono, errorAsignacion ] = await assignBonoService( validationResult.value );
        if (errorAsignacion) {
            handleErrorClient(res, 400, errorAsignacion as string);
            return;
        }
        handleSuccess(res, 201, "Bono asignado exitosamente", asignacionBono || {});
    } catch (error) {
        console.error("Error al asignar bono:", error);
        handleErrorServer(res, 500, "Error interno del servidor al asignar bono");
    }   
}

export async function updateAssignBono(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user?.id) {
            handleErrorClient(res, 401, "Usuario no autenticado");
            return;
        }
        // Validar que el usuario sea RRHH o SuperAdministrador
        if (req.user.role !== 'RecursosHumanos' && req.user.role !== 'SuperAdministrador') {
            handleErrorClient(res, 403, "No tiene permisos para actualizar asignaciones de bonos");
            return;
        }
        // Preparar los datos de la solicitud
        const requestData = {
            ...req.body,    
        };
        // Validar el cuerpo de la solicitud
        const validationResult = AsignarBonoValidation.validate(requestData, { abortEarly: false });
        if (validationResult.error) {
            handleErrorClient(res, 400, "Error de validación", {
                errors: validationResult.error.details.map(error => ({
                    field: error.path.join('.'),
                    message: error.message
                }))
            });
            return;
        }
        // Actualizar la asignación del bono
        const asignacionId = parseInt(req.params.id);
        if (isNaN(asignacionId)) {
            handleErrorClient(res, 400, "ID de asignación de bono inválido");
            return;
        }
        const [ asignacionActualizada, errorActualizacion ] = await updateAssingBonoService( validationResult.value, asignacionId );
        if (errorActualizacion) {
            handleErrorClient(res, 400, errorActualizacion as string);
            return;
        }
        handleSuccess(res, 200, "Asignación de bono actualizada exitosamente", asignacionActualizada || {});
    } catch (error) {
        console.error("Error al actualizar asignación de bono:", error);
        handleErrorServer(res, 500, "Error interno del servidor al actualizar asignación de bono");
    }
}