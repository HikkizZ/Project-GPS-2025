import Joi from "joi";
import { TipoCambioLaboral } from "../../types/recursosHumanos/cambiosLaborales.types.js";

const camposBase = {
    tipo: Joi.string()
        .valid(...Object.values(TipoCambioLaboral))
        .required()
        .messages({
            "string.base": "El tipo de cambio debe ser una cadena de texto",
            "any.only": "Tipo de cambio no válido",
            "any.required": "El tipo de cambio es requerido"
        }),

    trabajadorId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "El ID del trabajador debe ser un número",
            "number.integer": "El ID del trabajador debe ser un número entero",
            "number.positive": "El ID del trabajador debe ser positivo",
            "any.required": "El ID del trabajador es requerido"
        }),

    fechaInicio: Joi.date()
        .iso()
        .required()
        .messages({
            "date.base": "La fecha de inicio debe ser una fecha válida",
            "date.format": "La fecha de inicio debe estar en formato YYYY-MM-DD",
            "any.required": "La fecha de inicio es requerida"
        }),

    motivo: Joi.string()
        .min(10)
        .max(500)
        .required()
        .messages({
            "string.base": "El motivo debe ser una cadena de texto",
            "string.min": "El motivo debe tener al menos 10 caracteres",
            "string.max": "El motivo no puede exceder los 500 caracteres",
            "any.required": "El motivo es requerido"
        })
};

const camposEspecificos = {
    cargo: Joi.string()
        .min(2)
        .max(100)
        .messages({
            "string.base": "El cargo debe ser una cadena de texto",
            "string.min": "El cargo debe tener al menos 2 caracteres",
            "string.max": "El cargo no puede exceder los 100 caracteres"
        }),

    area: Joi.string()
        .min(2)
        .max(100)
        .messages({
            "string.base": "El área debe ser una cadena de texto",
            "string.min": "El área debe tener al menos 2 caracteres",
            "string.max": "El área no puede exceder los 100 caracteres"
        }),

    tipoContrato: Joi.string()
        .valid("Indefinido", "Plazo Fijo", "Por Obra", "Part-Time")
        .messages({
            "string.base": "El tipo de contrato debe ser una cadena de texto",
            "any.only": "Tipo de contrato no válido"
        }),

    sueldoBase: Joi.number()
        .positive()
        .precision(2)
        .messages({
            "number.base": "El sueldo base debe ser un número",
            "number.positive": "El sueldo base debe ser mayor a cero",
            "number.precision": "El sueldo base debe tener máximo 2 decimales"
        }),

    jornadaLaboral: Joi.string()
        .valid("Completa", "Media", "Part-Time")
        .messages({
            "string.base": "La jornada laboral debe ser una cadena de texto",
            "any.only": "Jornada laboral no válida"
        })
};

export const CambioLaboralValidation = Joi.object({
    ...camposBase,
    ...camposEspecificos
}).custom((value, helpers) => {
    const { tipo } = value;

    switch (tipo) {
        case TipoCambioLaboral.CAMBIO_CARGO:
            if (!value.cargo) {
                return helpers.error("El cargo es requerido para este tipo de cambio");
            }
            break;

        case TipoCambioLaboral.CAMBIO_AREA:
            if (!value.area) {
                return helpers.error("El área es requerida para este tipo de cambio");
            }
            break;

        case TipoCambioLaboral.CAMBIO_CONTRATO:
            if (!value.tipoContrato) {
                return helpers.error("El tipo de contrato es requerido para este tipo de cambio");
            }
            break;

        case TipoCambioLaboral.CAMBIO_SUELDO:
            if (!value.sueldoBase) {
                return helpers.error("El sueldo base es requerido para este tipo de cambio");
            }
            break;

        case TipoCambioLaboral.CAMBIO_JORNADA:
            if (!value.jornadaLaboral) {
                return helpers.error("La jornada laboral es requerida para este tipo de cambio");
            }
            break;
    }

    return value;
}); 