import Joi from "joi";

/* Query validation para búsqueda de historial laboral */
export const HistorialLaboralQueryValidation = Joi.object({
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
        })
})
.or('id', 'trabajadorId')
.unknown(false)
.messages({
    "object.unknown": "El objeto contiene campos no permitidos.",
    "object.missing": "Se requiere al menos uno de los siguientes campos: id o trabajadorId."
});

/* Body validation para creación de historial laboral */
export const CreateHistorialLaboralValidation = Joi.object({
    trabajadorId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "El ID del trabajador debe ser un número.",
            "number.integer": "El ID del trabajador debe ser un número entero.",
            "number.positive": "El ID del trabajador debe ser un número positivo.",
            "any.required": "El ID del trabajador es requerido."
        }),

    cargo: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            "string.base": "El cargo debe ser una cadena de texto.",
            "string.min": "El cargo debe tener al menos 2 caracteres.",
            "string.max": "El cargo no puede exceder los 100 caracteres.",
            "any.required": "El cargo es requerido."
        }),

    area: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            "string.base": "El área debe ser una cadena de texto.",
            "string.min": "El área debe tener al menos 2 caracteres.",
            "string.max": "El área no puede exceder los 100 caracteres.",
            "any.required": "El área es requerida."
        }),

    tipoContrato: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            "string.base": "El tipo de contrato debe ser una cadena de texto.",
            "string.min": "El tipo de contrato debe tener al menos 2 caracteres.",
            "string.max": "El tipo de contrato no puede exceder los 50 caracteres.",
            "any.required": "El tipo de contrato es requerido."
        }),

    sueldoBase: Joi.number()
        .positive()
        .required()
        .messages({
            "number.base": "El sueldo base debe ser un número.",
            "number.positive": "El sueldo base debe ser un número positivo.",
            "any.required": "El sueldo base es requerido."
        }),

    fechaInicio: Joi.date()
        .iso()
        .required()
        .messages({
            "date.base": "La fecha de inicio debe ser una fecha válida.",
            "date.format": "La fecha de inicio debe estar en formato ISO.",
            "any.required": "La fecha de inicio es requerida."
        }),

    fechaFin: Joi.date()
        .iso()
        .greater(Joi.ref('fechaInicio'))
        .allow(null)
        .messages({
            "date.base": "La fecha de fin debe ser una fecha válida.",
            "date.format": "La fecha de fin debe estar en formato ISO.",
            "date.greater": "La fecha de fin debe ser posterior a la fecha de inicio."
        }),

    motivoTermino: Joi.string()
        .min(10)
        .max(500)
        .allow(null)
        .messages({
            "string.base": "El motivo de término debe ser una cadena de texto.",
            "string.min": "El motivo de término debe tener al menos 10 caracteres.",
            "string.max": "El motivo de término no puede exceder los 500 caracteres."
        }),

    contratoURL: Joi.string()
        .uri()
        .allow(null)
        .messages({
            "string.base": "La URL del contrato debe ser una cadena de texto.",
            "string.uri": "La URL del contrato debe ser una URL válida."
        })
});

/* Body validation para actualización de historial laboral */
export const UpdateHistorialLaboralValidation = Joi.object({
    fechaFin: Joi.date()
        .iso()
        .required()
        .messages({
            "date.base": "La fecha de fin debe ser una fecha válida.",
            "date.format": "La fecha de fin debe estar en formato ISO.",
            "any.required": "La fecha de fin es requerida."
        }),

    motivoTermino: Joi.string()
        .min(10)
        .max(500)
        .required()
        .messages({
            "string.base": "El motivo de término debe ser una cadena de texto.",
            "string.min": "El motivo de término debe tener al menos 10 caracteres.",
            "string.max": "El motivo de término no puede exceder los 500 caracteres.",
            "any.required": "El motivo de término es requerido."
        })
}); 