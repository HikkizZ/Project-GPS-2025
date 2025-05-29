import { Request, Response } from "express";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js";
import { FichaEmpresaQueryValidation, FichaEmpresaBodyValidation } from "../../validations/recursosHumanos/fichaEmpresa.validation.js";
import { AppDataSource } from "../../config/configDB.js";
import { FichaEmpresa, EstadoLaboral } from "../../entity/recursosHumanos/fichaEmpresa.entity.js";
import { ServiceResponse } from "../../../types.js";
import {
    searchFichasEmpresa,
    getFichaEmpresaById,
    getMiFichaService,
    updateFichaEmpresaService,
    actualizarEstadoFichaService,
    descargarContratoService
} from "../../services/recursosHumanos/fichaEmpresa.service.js";
import { FichaEmpresaUpdateValidation, EstadoFichaValidation } from "../../validations/recursosHumanos/fichaEmpresa.validation.js";

export async function getFichasEmpresa(req: Request, res: Response) {
    try {
        const [fichas, error] = await searchFichasEmpresa(req.query);

        if (error) {
            const errorMessage = typeof error === 'string' ? error : error.message;
            handleErrorClient(res, 404, errorMessage);
            return;
        }

        handleSuccess(res, 200, "Fichas de empresa recuperadas exitosamente", fichas!);
    } catch (error) {
        console.error("Error al obtener fichas de empresa:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

export async function getFichaEmpresa(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            handleErrorClient(res, 400, "ID inválido");
            return;
        }

        const [ficha, error] = await getFichaEmpresaById(id);

        if (error) {
            const errorMessage = typeof error === 'string' ? error : error.message;
            handleErrorClient(res, 404, errorMessage);
            return;
        }

        handleSuccess(res, 200, "Ficha de empresa recuperada exitosamente", ficha!);
    } catch (error) {
        console.error("Error al obtener ficha de empresa:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

export async function getMiFicha(req: Request, res: Response) {
    try {
        if (!req.user?.id) {
            handleErrorClient(res, 401, "Usuario no autenticado");
            return;
        }

        const [ficha, error] = await getMiFichaService(req.user.id);

        if (error) {
            const errorMessage = typeof error === 'string' ? error : error.message;
            handleErrorClient(res, 404, errorMessage);
            return;
        }

        handleSuccess(res, 200, "Ficha recuperada exitosamente", ficha!);
    } catch (error) {
        console.error("Error al obtener mi ficha:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

export async function updateFichaEmpresa(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            handleErrorClient(res, 400, "ID inválido");
            return;
        }

        const validationResult = FichaEmpresaUpdateValidation.validate(req.body);
        if (validationResult.error) {
            handleErrorClient(res, 400, validationResult.error.message);
            return;
        }

        const [ficha, error] = await updateFichaEmpresaService(id, validationResult.value);

        if (error) {
            const errorMessage = typeof error === 'string' ? error : error.message;
            handleErrorClient(res, 404, errorMessage);
            return;
        }

        handleSuccess(res, 200, "Ficha actualizada exitosamente", ficha!);
    } catch (error) {
        console.error("Error en updateFichaEmpresa:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

export async function actualizarEstadoFicha(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            handleErrorClient(res, 400, "ID inválido");
            return;
        }

        if (!req.user?.id) {
            handleErrorClient(res, 401, "Usuario no autenticado");
            return;
        }

        const validationResult = EstadoFichaValidation.validate(req.body);
        if (validationResult.error) {
            handleErrorClient(res, 400, validationResult.error.message);
            return;
        }

        const { estado, fechaInicio, fechaFin, motivo } = validationResult.value;

        const [ficha, error] = await actualizarEstadoFichaService(
            id,
            estado,
            fechaInicio,
            fechaFin,
            motivo,
            req.user.id
        );

        if (error) {
            const errorMessage = typeof error === 'string' ? error : error.message;
            if (errorMessage.includes("No tiene permiso")) {
                handleErrorClient(res, 403, errorMessage);
                return;
            }
            if (errorMessage.includes("Ficha no encontrada")) {
                handleErrorClient(res, 404, errorMessage);
                return;
            }
            // Por defecto, cualquier otro error es un error de validación
            handleErrorClient(res, 400, errorMessage);
            return;
        }

        handleSuccess(res, 200, "Estado de ficha actualizado exitosamente", ficha!);
    } catch (error) {
        console.error("Error en actualizarEstadoFicha:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

export async function descargarContrato(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            handleErrorClient(res, 400, "ID inválido");
            return;
        }

        if (!req.user?.id) {
            handleErrorClient(res, 401, "Usuario no autenticado");
            return;
        }

        const [contratoURL, error] = await descargarContratoService(id, req.user.id);

        if (error) {
            const errorMessage = typeof error === 'string' ? error : error.message;
            if (errorMessage.includes("No tiene permiso")) {
                handleErrorClient(res, 403, errorMessage);
                return;
            }
            handleErrorClient(res, 404, errorMessage);
            return;
        }

        handleSuccess(res, 200, "URL de contrato recuperada exitosamente", { url: contratoURL });
    } catch (error) {
        console.error("Error en descargarContrato:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
} 