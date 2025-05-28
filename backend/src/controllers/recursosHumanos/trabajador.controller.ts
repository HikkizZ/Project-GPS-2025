import { Request, Response } from "express";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js";
import {
    createTrabajadorService,
    getTrabajadoresService,
    getTrabajadorByIdService,
    updateTrabajadorService,
    deleteTrabajadorService
} from "../../services/recursosHumanos/trabajador.service.js";
import { TrabajadorBodyValidation } from "../../validations/recursosHumanos/trabajador.validation.js";
import { TrabajadorUpdateValidation } from "../../validations/recursosHumanos/trabajador.validation.js";

export async function createTrabajador(req: Request, res: Response): Promise<void> {
    try {
        // Validar el cuerpo de la petición
        const validationResult = TrabajadorBodyValidation.validate(req.body);
        if (validationResult.error) {
            handleErrorClient(res, 400, validationResult.error.message);
            return;
        }

        const [trabajador, serviceError] = await createTrabajadorService(req.body);
        
        if (serviceError) {
            handleErrorClient(res, 400, serviceError.message);
            return;
        }

        handleSuccess(res, 201, "Trabajador creado exitosamente", trabajador);
    } catch (error) {
        console.error("Error al crear trabajador:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

export async function getTrabajadores(req: Request, res: Response): Promise<void> {
    try {
        const [trabajadores, serviceError] = await getTrabajadoresService();
        
        if (serviceError) {
            handleErrorServer(res, 500, serviceError.message);
            return;
        }

        handleSuccess(res, 200, "Trabajadores recuperados exitosamente", trabajadores);
    } catch (error) {
        console.error("Error al obtener trabajadores:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

export async function getTrabajadorById(req: Request, res: Response): Promise<void> {
    try {
        const [trabajador, serviceError] = await getTrabajadorByIdService(parseInt(req.params.id));
        
        if (serviceError) {
            handleErrorClient(res, 404, serviceError.message);
            return;
        }

        handleSuccess(res, 200, "Trabajador recuperado exitosamente", trabajador);
    } catch (error) {
        console.error("Error al obtener trabajador:", error);
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
            handleErrorClient(res, serviceError.message.includes("no encontrado") ? 404 : 400, serviceError.message);
            return;
        }

        handleSuccess(res, 200, "Trabajador actualizado exitosamente", trabajador);
    } catch (error) {
        console.error("Error al actualizar trabajador:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

export async function deleteTrabajador(req: Request, res: Response): Promise<void> {
    try {
        const [success, serviceError] = await deleteTrabajadorService(parseInt(req.params.id));
        
        if (serviceError) {
            handleErrorClient(res, 404, serviceError.message);
            return;
        }

        handleSuccess(res, 200, "Trabajador eliminado exitosamente");
    } catch (error) {
        console.error("Error al eliminar trabajador:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
} 