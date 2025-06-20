import { Request, Response } from "express";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js";
import {
    createTrabajadorService,
    getTrabajadoresService,
    searchTrabajadoresService,
    updateTrabajadorService,
    desvincularTrabajadorService
} from "../../services/recursosHumanos/trabajador.service.js";
import { TrabajadorBodyValidation, TrabajadorQueryValidation, TrabajadorUpdateValidation } from "../../validations/recursosHumanos/trabajador.validation.js";

export async function createTrabajador(req: Request, res: Response): Promise<void> {
    try {
        const validationResult = TrabajadorBodyValidation.validate(req.body);
        if (validationResult.error) {
            handleErrorClient(res, 400, validationResult.error.message);
            return;
        }

        const [result, serviceError] = await createTrabajadorService(req.body);
        
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
        const incluirInactivos = req.query.todos === 'true';
        const [trabajadores, serviceError] = await getTrabajadoresService(incluirInactivos);
        
        if (serviceError) {
            handleErrorClient(res, 404, typeof serviceError === 'string' ? serviceError : serviceError.message);
            return;
        }

        if (!trabajadores) {
            handleErrorClient(res, 404, "No se encontraron trabajadores");
            return;
        }

        handleSuccess(res, 200, "Trabajadores obtenidos exitosamente", trabajadores);
    } catch (error) {
        console.error("Error al obtener trabajadores:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

export async function searchTrabajadores(req: Request, res: Response): Promise<void> {
    try {
        console.log("🔍 Query recibida:", req.query);
        
        const { error } = TrabajadorQueryValidation.validate(req.query);
        if (error) {
            console.log("❌ Error de validación:", error.message);
            handleErrorClient(res, 400, error.message);
            return;
        }

        const query = {
            ...req.query,
            enSistema: req.query.enSistema === "true" ? true : req.query.enSistema === "false" ? false : undefined,
            todos: req.query.todos === "true" ? true : undefined
        };
        console.log("🔄 Query procesada:", query);

        const [trabajadores, serviceError] = await searchTrabajadoresService(query);
        console.log("📊 Resultado del servicio:", { trabajadores: trabajadores?.length || 0, serviceError });

        if (serviceError) {
            console.log("❌ Error del servicio:", serviceError);
            handleErrorClient(res, 404, typeof serviceError === 'string' ? serviceError : serviceError.message);
            return;
        }

        if (!trabajadores || trabajadores.length === 0) {
            console.log("❌ No se encontraron trabajadores");
            handleErrorClient(res, 404, "No se encontraron trabajadores que coincidan con los criterios de búsqueda");
            return;
        }

        console.log("✅ Trabajadores encontrados:", trabajadores.length);
        handleSuccess(res, 200, "Trabajadores encontrados exitosamente", trabajadores);
    } catch (error) {
        console.error("❌ Error en searchTrabajadores:", error);
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