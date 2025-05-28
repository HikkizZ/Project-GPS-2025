import { Request, Response } from "express";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js";
import {
    createTrabajadorService,
    getTrabajadoresService,
    getTrabajadorByIdService,
    updateTrabajadorService,
    deleteTrabajadorService
} from "../../services/recursosHumanos/trabajador.service.js";

export async function createTrabajador(req: Request, res: Response): Promise<void> {
    try {
        const [trabajador, error] = await createTrabajadorService(req.body);
        
        if (error) {
            handleErrorClient(res, 400, error.message);
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
        const [trabajadores, error] = await getTrabajadoresService();
        
        if (error) {
            handleErrorServer(res, 500, error.message);
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
        const [trabajador, error] = await getTrabajadorByIdService(parseInt(req.params.id));
        
        if (error) {
            handleErrorClient(res, 404, error.message);
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
        const [trabajador, error] = await updateTrabajadorService(parseInt(req.params.id), req.body);
        
        if (error) {
            handleErrorClient(res, error.message.includes("no encontrado") ? 404 : 400, error.message);
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
        const [success, error] = await deleteTrabajadorService(parseInt(req.params.id));
        
        if (error) {
            handleErrorClient(res, 404, error.message);
            return;
        }

        handleSuccess(res, 200, "Trabajador eliminado exitosamente");
    } catch (error) {
        console.error("Error al eliminar trabajador:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
} 