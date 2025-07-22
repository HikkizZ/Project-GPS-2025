import { Request, Response } from "express";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js";
import {
    createTrabajadorService,
    getTrabajadoresService,
    updateTrabajadorService,
    desvincularTrabajadorService,
    reactivarTrabajadorService
} from "../../services/recursosHumanos/trabajador.service.js";
import { TrabajadorBodyValidation, TrabajadorQueryValidation, TrabajadorUpdateValidation, TrabajadorReactivacionValidation } from "../../validations/recursosHumanos/trabajador.validation.js";

export async function createTrabajador(req: Request, res: Response): Promise<void> {
    try {
        const validationResult = TrabajadorBodyValidation.validate(req.body);
        if (validationResult.error) {
            handleErrorClient(res, 400, validationResult.error.message);
            return;
        }

        // PASAR req.user como segundo parámetro
        const [result, serviceError] = await createTrabajadorService(req.body, req.user);
        
        if (serviceError) {
            const errorMessage = typeof serviceError === 'string' ? serviceError : serviceError?.message || "No se pudo crear el trabajador";
            handleErrorClient(res, 400, errorMessage);
            return;
        }

        if (!result || !result.trabajador) {
            handleErrorClient(res, 400, "No se pudo crear el trabajador");
            return;
        }

        // Incluir advertencias en la respuesta si existen
        const responseData = {
            trabajador: result.trabajador,
            advertencias: result.advertencias || [],
            correoUsuario: result.correoUsuario
        };

        handleSuccess(res, 201, "Trabajador creado exitosamente", responseData);
    } catch (error) {
        console.error("Error al crear trabajador:", error);
        // Asegurarnos de que la respuesta de error llegue al cliente
        if (!res.headersSent) {
            handleErrorServer(res, 500, "Error interno del servidor");
        }
    }
}

export async function getTrabajadores(req: Request, res: Response): Promise<void> {
    try {
        // Validar los query params
        const { error, value: filtros } = TrabajadorQueryValidation.validate(req.query, { stripUnknown: true });
        if (error) {
            handleErrorClient(res, 400, error.message);
            return;
        }
        // Separar el flag de incluir inactivos
        const incluirInactivos = filtros.todos === true || filtros.todos === 'true';
        // Eliminar 'todos' del objeto de filtros para no pasarlo como filtro de campo
        delete filtros.todos;
        // Llamar al servicio con los filtros
        const [trabajadores, serviceError] = await getTrabajadoresService(incluirInactivos, filtros);
        if (serviceError) {
            handleErrorClient(res, 404, typeof serviceError === 'string' ? serviceError : serviceError.message);
            return;
        }
        const trabajadoresData = trabajadores || [];
        const mensaje = trabajadoresData.length === 0 
            ? "No hay trabajadores registrados en el sistema" 
            : "Trabajadores obtenidos exitosamente";
        handleSuccess(res, 200, mensaje, trabajadoresData);
    } catch (error) {
        console.error("Error al obtener trabajadores:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

export async function updateTrabajador(req: Request, res: Response): Promise<void> {
    try {
        const validationResult = TrabajadorUpdateValidation.validate(req.body, { allowUnknown: false, stripUnknown: true });

        if (validationResult.error) {
            handleErrorClient(res, 400, validationResult.error.message);
            return;
        }

        const [trabajador, serviceError] = await updateTrabajadorService(parseInt(req.params.id), validationResult.value);

        if (serviceError) {
            const errorMessage = typeof serviceError === 'string' ? serviceError : serviceError.message;
            const statusCode = errorMessage.includes("no encontrado") ? 404 : 400;
            handleErrorClient(res, statusCode, errorMessage);
            return;
        }

        if (!trabajador) {
            handleErrorClient(res, 404, "No se pudo actualizar el trabajador");
            return;
        }

        handleSuccess(res, 200, "Trabajador actualizado exitosamente", trabajador);
    } catch (error) {
        console.error("Error al actualizar trabajador:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

export async function desvincularTrabajador(req: Request, res: Response): Promise<void> {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            handleErrorClient(res, 400, "ID inválido");
            return;
        }

        const { motivo } = req.body;
        if (!motivo || typeof motivo !== 'string' || motivo.trim().length < 3) {
            handleErrorClient(res, 400, "El motivo de desvinculación es requerido y debe tener al menos 3 caracteres");
            return;
        }

        const [trabajador, error] = await desvincularTrabajadorService(id, motivo.trim(), req.user?.id);

        if (error) {
            const errorMessage = typeof error === 'string' ? error : error.message;
            if (errorMessage.includes("No tiene permiso")) {
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

        if (!trabajador) {
            handleErrorClient(res, 404, "No se pudo desvincular el trabajador");
            return;
        }

        handleSuccess(res, 200, "Trabajador desvinculado exitosamente", trabajador);
    } catch (error) {
        console.error("Error en desvincularTrabajador:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
} 

export async function reactivarTrabajador(req: Request, res: Response): Promise<void> {
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
        const validationResult = TrabajadorReactivacionValidation.validate(req.body);
        if (validationResult.error) {
            handleErrorClient(res, 400, validationResult.error.message);
            return;
        }

        const [result, serviceError] = await reactivarTrabajadorService(idNumber, req.body, userId);
        
        if (serviceError) {
            const errorMessage = typeof serviceError === 'string' ? serviceError : serviceError?.message || "No se pudo reactivar el trabajador";
            handleErrorClient(res, 400, errorMessage);
            return;
        }

        if (!result) {
            handleErrorClient(res, 400, "No se pudo reactivar el trabajador");
            return;
        }

        handleSuccess(res, 200, "Trabajador reactivado exitosamente", {
            trabajador: result.trabajador,
            nuevoCorreoCorporativo: result.nuevoCorreoCorporativo,
            credencialesEnviadas: result.credencialesEnviadas
        });
    } catch (error) {
        console.error("Error al reactivar trabajador:", error);
        if (!res.headersSent) {
            handleErrorServer(res, 500, "Error interno del servidor");
        }
    }
} 