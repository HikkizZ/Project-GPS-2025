import { Request, Response } from "express";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js";
import { HistorialLaboralQueryValidation, CreateHistorialLaboralValidation, UpdateHistorialLaboralValidation } from "../../validations/recursosHumanos/historialLaboral.validation.js";
import { createHistorialLaboralService, getHistorialLaboralByTrabajadorService, getHistorialLaboralByIdService, updateHistorialLaboralService, descargarContratoService } from "../../services/recursosHumanos/historialLaboral.service.js";
import { User } from "../../entity/user.entity.js";
import { AppDataSource } from "../../config/configDB.js";
import { Trabajador } from "../../entity/recursosHumanos/trabajador.entity.js";

export async function createHistorialLaboral(req: Request, res: Response): Promise<void> {
    try {
        const { error, value } = CreateHistorialLaboralValidation.validate(req.body);
        if (error) {
            handleErrorClient(res, error.details[0].message);
            return;
        }

        // Agregar el usuario que registra
        const registradoPor = req.user as User;
        const data = { ...value, registradoPor };

        const [historial, errorMsg] = await createHistorialLaboralService(data);
        if (errorMsg) {
            handleErrorClient(res, 400, errorMsg);
            return;
        }

        handleSuccess(res, 201, "Historial laboral creado exitosamente", historial);
    } catch (error) {
        handleErrorServer(res, "Error al crear registro de historial laboral.");
    }
}

export async function getHistorialLaboral(req: Request, res: Response): Promise<void> {
    try {
        const user = req.user as User;
        let historial, errorMsg;

        // Si es un trabajador, solo puede ver su propio historial
        if (user.role === "Trabajador" || req.path.includes("mi-historial")) {
            const trabajadorRepo = AppDataSource.getRepository(Trabajador);
            const trabajador = await trabajadorRepo.findOne({
                where: { rut: user.rut }
            });

            if (!trabajador) {
                handleErrorClient(res, 404, "Trabajador no encontrado");
                return;
            }

            [historial, errorMsg] = await getHistorialLaboralByTrabajadorService(trabajador.id);
        } else {
            // RRHH puede ver cualquier historial
            const trabajadorId = parseInt(req.params.id);
            if (isNaN(trabajadorId)) {
                handleErrorClient(res, 400, "ID de trabajador inválido");
                return;
            }
            [historial, errorMsg] = await getHistorialLaboralByTrabajadorService(trabajadorId);
        }

        if (errorMsg) {
            const statusCode = errorMsg.includes("no encontrado") ? 404 : 400;
            handleErrorClient(res, statusCode, errorMsg);
            return;
        }

        handleSuccess(res, 200, "Historial laboral obtenido exitosamente", historial || []);
    } catch (error) {
        console.error("Error al obtener historial laboral:", error);
        handleErrorServer(res, "Error al obtener historial laboral.");
    }
}

export async function updateHistorialLaboral(req: Request, res: Response): Promise<void> {
    try {
        const { error, value } = UpdateHistorialLaboralValidation.validate(req.body);
        if (error) {
            handleErrorClient(res, error.details[0].message);
            return;
        }

        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            handleErrorClient(res, "ID inválido.");
            return;
        }

        const [historial, errorMsg] = await updateHistorialLaboralService(id, value);
        if (errorMsg) {
            const statusCode = errorMsg.includes("no encontrado") ? 404 : 400;
            handleErrorClient(res, statusCode, errorMsg);
            return;
        }

        handleSuccess(res, 200, "Historial laboral actualizado exitosamente", historial);
    } catch (error) {
        handleErrorServer(res, "Error al actualizar registro de historial laboral.");
    }
}

export async function descargarContrato(req: Request, res: Response): Promise<void> {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            handleErrorClient(res, "ID inválido.");
            return;
        }

        const [contratoURL, errorMsg] = await descargarContratoService(id);
        if (errorMsg) {
            handleErrorClient(res, errorMsg);
            return;
        }

        handleSuccess(res, { contratoURL });
    } catch (error) {
        handleErrorServer(res, "Error al descargar contrato.");
    }
} 