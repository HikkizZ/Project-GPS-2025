import Joi from "joi";
import { EstadoLaboral } from "../../entity/recursosHumanos/fichaEmpresa.entity.js";

/* Query validation para búsqueda de fichas de empresa */
export const FichaEmpresaQueryValidation = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .messages({
            "number.base": "El ID debe ser un número.",
            "number.integer": "El ID debe ser un número entero.",
            "number.positive": "El ID debe ser un número positivo."
        }),
    trabajadorId: Joi.number()
        .integer()
        .positive()
        .messages({
            "number.base": "El ID del trabajador debe ser un número.",
            "number.integer": "El ID del trabajador debe ser un número entero.",
            "number.positive": "El ID del trabajador debe ser un número positivo."
        }),
    estado: Joi.string()
        .valid(...Object.values(EstadoLaboral))
        .messages({
            "any.only": "El estado laboral no es válido.",
            "string.base": "El estado laboral debe ser una cadena de texto."
        })
})
.or('id', 'trabajadorId', 'estado')
.unknown(false)
.messages({
    "object.unknown": "El objeto contiene campos no permitidos.",
    "object.missing": "Se requiere al menos uno de los siguientes campos: id, trabajadorId o estado."
});

/* Body validation para actualización de ficha de empresa */
export const FichaEmpresaBodyValidation = Joi.object({
    cargo: Joi.string()
        .min(3)
        .max(100)
        .messages({
            "string.base": "El cargo debe ser una cadena de texto.",
            "string.min": "El cargo debe tener al menos 3 caracteres.",
            "string.max": "El cargo no puede exceder los 100 caracteres."
        }),

    area: Joi.string()
        .min(3)
        .max(100)
        .messages({
            "string.base": "El área debe ser una cadena de texto.",
            "string.min": "El área debe tener al menos 3 caracteres.",
            "string.max": "El área no puede exceder los 100 caracteres."
        }),

    empresa: Joi.string()
        .min(3)
        .max(100)
        .allow(null)
        .messages({
            "string.base": "La empresa debe ser una cadena de texto.",
            "string.min": "La empresa debe tener al menos 3 caracteres.",
            "string.max": "La empresa no puede exceder los 100 caracteres."
        }),

    tipoContrato: Joi.string()
        .min(3)
        .max(50)
        .messages({
            "string.base": "El tipo de contrato debe ser una cadena de texto.",
            "string.min": "El tipo de contrato debe tener al menos 3 caracteres.",
            "string.max": "El tipo de contrato no puede exceder los 50 caracteres."
        }),

    jornadaLaboral: Joi.string()
        .min(3)
        .max(50)
        .allow(null)
        .messages({
            "string.base": "La jornada laboral debe ser una cadena de texto.",
            "string.min": "La jornada laboral debe tener al menos 3 caracteres.",
            "string.max": "La jornada laboral no puede exceder los 50 caracteres."
        }),

    sueldoBase: Joi.number()
        .positive()
        .precision(2)
        .messages({
            "number.base": "El sueldo base debe ser un número.",
            "number.positive": "El sueldo base debe ser mayor a cero.",
            "number.precision": "El sueldo base debe tener máximo 2 decimales."
        }),

    fechaInicioContrato: Joi.date()
        .iso()
        .messages({
            "date.base": "La fecha de inicio debe ser una fecha válida.",
            "date.format": "La fecha de inicio debe estar en formato YYYY-MM-DD"
        }),

    fechaFinContrato: Joi.date()
        .iso()
        .min(Joi.ref('fechaInicioContrato'))
        .allow(null)
        .messages({
            "date.base": "La fecha de fin debe ser una fecha válida.",
            "date.format": "La fecha de fin debe estar en formato YYYY-MM-DD",
            "date.min": "La fecha de fin debe ser posterior a la fecha de inicio"
        }),

    estado: Joi.string()
        .valid(...Object.values(EstadoLaboral))
        .messages({
            "any.only": "El estado laboral no es válido.",
            "string.base": "El estado laboral debe ser una cadena de texto."
        })
}); 