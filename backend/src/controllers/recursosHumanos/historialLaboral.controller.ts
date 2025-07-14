import { Request, Response } from "express";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js";
import { HistorialLaboralQueryValidation, CreateHistorialLaboralValidation, UpdateHistorialLaboralValidation } from "../../validations/recursosHumanos/historialLaboral.validation.js";
import { createHistorialLaboralService, getHistorialLaboralByTrabajadorService, getHistorialLaboralByIdService, updateHistorialLaboralService, descargarContratoService, procesarCambioLaboralService } from "../../services/recursosHumanos/historialLaboral.service.js";
import { User } from "../../entity/user.entity.js";
import { AppDataSource } from "../../config/configDB.js";
import { Trabajador } from "../../entity/recursosHumanos/trabajador.entity.js";

export async function createHistorialLaboral(req: Request, res: Response): Promise<void> {
    try {
        const { error, value } = CreateHistorialLaboralValidation.validate(req.body);
        if (error) {
            handleErrorClient(res, 400, error.details[0].message);
            return;
        }

        // Agregar el usuario que registra
        const registradoPor = req.user as User;
        const data = { ...value, registradoPor };

        const [historial, errorMsg] = await createHistorialLaboralService(data);
        if (errorMsg) {
            handleErrorClient(res, 400, typeof errorMsg === 'string' ? errorMsg : errorMsg.message);
            return;
        }

        if (!historial) {
            handleErrorClient(res, 400, "No se pudo crear el historial laboral");
            return;
        }

        handleSuccess(res, 201, "Historial laboral creado exitosamente", historial);
    } catch (error) {
        console.error("Error al crear historial laboral:", error);
        handleErrorServer(res, 500, "Error al crear registro de historial laboral.");
    }
}

export async function getHistorialLaboral(req: Request, res: Response): Promise<void> {
    try {
        const user = req.user as User;
        let historial, errorMsg;

        // Buscar el trabajador asociado al usuario
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        const trabajador = user.rut ? await trabajadorRepo.findOne({
            where: { rut: user.rut }
        }) : null;

        if (!trabajador) {
            handleErrorClient(res, 400, "Trabajador no encontrado");
            return;
        }

        // Si es un trabajador, solo puede ver su propio historial
        if (user.role === "Usuario" || req.path.includes("mi-historial")) {
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
            const errorMessage = typeof errorMsg === 'string' ? errorMsg : errorMsg.message;
            const statusCode = errorMessage.includes("no encontrado") ? 404 : 400;
            handleErrorClient(res, statusCode, errorMessage);
            return;
        }

        handleSuccess(res, 200, "Historial laboral obtenido exitosamente", historial || []);
    } catch (error) {
        console.error("Error al obtener historial laboral:", error);
        handleErrorServer(res, 500, "Error al obtener historial laboral.");
    }
}

export async function updateHistorialLaboral(req: Request, res: Response): Promise<void> {
    try {
        const { error, value } = UpdateHistorialLaboralValidation.validate(req.body);
        if (error) {
            handleErrorClient(res, 400, error.details[0].message);
            return;
        }

        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            handleErrorClient(res, 400, "ID inválido");
            return;
        }

        const [historial, errorMsg] = await updateHistorialLaboralService(id, value);
        if (errorMsg) {
            const errorMessage = typeof errorMsg === 'string' ? errorMsg : errorMsg.message;
            const statusCode = errorMessage.includes("no encontrado") ? 404 : 400;
            handleErrorClient(res, statusCode, errorMessage);
            return;
        }

        if (!historial) {
            handleErrorClient(res, 404, "No se pudo actualizar el historial laboral");
            return;
        }

        handleSuccess(res, 200, "Historial laboral actualizado exitosamente", historial);
    } catch (error) {
        console.error("Error al actualizar historial laboral:", error);
        handleErrorServer(res, 500, "Error al actualizar registro de historial laboral.");
    }
}

export async function descargarContrato(req: Request, res: Response): Promise<void> {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            handleErrorClient(res, 400, "ID inválido");
            return;
        }

        const [contratoURL, errorMsg] = await descargarContratoService(id);
        if (errorMsg) {
            handleErrorClient(res, 400, typeof errorMsg === 'string' ? errorMsg : errorMsg.message);
            return;
        }

        if (!contratoURL) {
            handleErrorClient(res, 404, "No se encontró el contrato");
            return;
        }

        handleSuccess(res, 200, "Contrato obtenido exitosamente", { contratoURL });
    } catch (error) {
        console.error("Error al descargar contrato:", error);
        handleErrorServer(res, 500, "Error al descargar contrato.");
    }
}

export async function procesarCambioLaboral(req: Request, res: Response): Promise<void> {
    try {
        const trabajadorId = parseInt(req.params.trabajadorId);
        if (isNaN(trabajadorId)) {
            handleErrorClient(res, 400, "ID de trabajador inválido");
            return;
        }

        const { tipo, fechaInicio, motivo, cargo, area, tipoContrato, sueldoBase } = req.body;
        
        // Validar tipo de cambio
        const tiposValidos = ['DESVINCULACION', 'CAMBIO_CARGO', 'CAMBIO_AREA', 'CAMBIO_CONTRATO', 'CAMBIO_SUELDO'];
        if (!tiposValidos.includes(tipo)) {
            handleErrorClient(res, 400, "Tipo de cambio no válido");
            return;
        }

        // Validar campos requeridos según el tipo
        if (!fechaInicio || !motivo) {
            handleErrorClient(res, 400, "Fecha de inicio y motivo son requeridos");
            return;
        }

        const registradoPor = req.user as User;
        const [historial, errorMsg] = await procesarCambioLaboralService(trabajadorId, tipo, {
            fechaInicio: new Date(fechaInicio),
            motivo,
            registradoPor,
            cargo,
            area,
            tipoContrato,
            sueldoBase
        });

        if (errorMsg) {
            handleErrorClient(res, 400, typeof errorMsg === 'string' ? errorMsg : errorMsg.message);
            return;
        }

        if (!historial) {
            handleErrorClient(res, 400, "No se pudo procesar el cambio laboral");
            return;
        }

        handleSuccess(res, 200, "Cambio laboral procesado exitosamente", historial);
    } catch (error) {
        console.error("Error al procesar cambio laboral:", error);
        handleErrorServer(res, 500, "Error al procesar cambio laboral");
    }
} 