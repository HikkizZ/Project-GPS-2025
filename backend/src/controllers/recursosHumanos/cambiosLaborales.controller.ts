import { Request, Response } from "express";
import { procesarCambioLaboralService } from "../../services/recursosHumanos/cambiosLaborales.service.js";
import { TipoCambioLaboral } from "../../types/recursosHumanos/cambiosLaborales.types.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js";

export async function procesarCambioLaboral(req: Request, res: Response) {
    try {
        if (!req.user?.id) {
            handleErrorClient(res, 401, "Usuario no autenticado");
            return;
        }

        const { tipo, trabajadorId, fechaInicio, motivo, ...datosAdicionales } = req.body;

        // Validar tipo de cambio
        if (!Object.values(TipoCambioLaboral).includes(tipo)) {
            handleErrorClient(res, 400, "Tipo de cambio no válido");
            return;
        }

        // Validar campos requeridos comunes
        if (!trabajadorId || !fechaInicio || !motivo) {
            handleErrorClient(res, 400, "Faltan campos requeridos (trabajadorId, fechaInicio, motivo)");
            return;
        }

        // Validar campos específicos según el tipo
        switch (tipo) {
            case TipoCambioLaboral.CAMBIO_CARGO:
                if (!datosAdicionales.cargo) {
                    handleErrorClient(res, 400, "El cargo es requerido para este tipo de cambio");
                    return;
                }
                break;

            case TipoCambioLaboral.CAMBIO_AREA:
                if (!datosAdicionales.area) {
                    handleErrorClient(res, 400, "El área es requerida para este tipo de cambio");
                    return;
                }
                break;

            case TipoCambioLaboral.CAMBIO_CONTRATO:
                if (!datosAdicionales.tipoContrato) {
                    handleErrorClient(res, 400, "El tipo de contrato es requerido para este tipo de cambio");
                    return;
                }
                break;

            case TipoCambioLaboral.CAMBIO_SUELDO:
                if (!datosAdicionales.sueldoBase || datosAdicionales.sueldoBase <= 0) {
                    handleErrorClient(res, 400, "El sueldo base es requerido y debe ser mayor a cero");
                    return;
                }
                break;

            case TipoCambioLaboral.CAMBIO_JORNADA:
                if (!datosAdicionales.jornadaLaboral) {
                    handleErrorClient(res, 400, "La jornada laboral es requerida para este tipo de cambio");
                    return;
                }
                break;
        }

        const [respuesta, error] = await procesarCambioLaboralService(tipo, {
            trabajadorId,
            fechaInicio: new Date(fechaInicio),
            motivo,
            registradoPor: req.user,
            ...datosAdicionales
        });

        if (error) {
            const errorMessage = typeof error === 'string' ? error : error.message;
            handleErrorClient(res, 400, errorMessage);
            return;
        }

        handleSuccess(res, 200, "Cambio laboral procesado exitosamente", respuesta || {});
    } catch (error) {
        console.error("Error en procesarCambioLaboral:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
} 