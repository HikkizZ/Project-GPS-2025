import Joi from "joi";

export const createFailureReportValidation = Joi.object({
    maquinariaId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "any.required": "El ID de la maquinaria es obligatorio.",
            "number.base": "El ID debe ser un número.",
            "number.integer": "El ID debe ser un número entero.",
            "number.positive": "El ID debe ser mayor a cero.",
        }),

    date: Joi.date()
        .required()
        .messages({
            "any.required": "La fecha del fallo es obligatoria.",
            "date.base": "Debe ser una fecha válida."
        }),

    description: Joi.string()
        .max(255)
        .required()
        .messages({
            "any.required": "La descripción del fallo es obligatoria.",
            "string.base": "La descripción debe ser texto.",
            "string.max": "La descripción no debe superar los 255 caracteres."
        }),

    resolved: Joi.boolean()
        .messages({
            "boolean.base": "El campo 'resolved' debe ser booleano."
        })
}).messages({
    "object.unknown": "No se permiten propiedades adicionales."
});

export const failureQueryValidation = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "El ID debe ser un número.",
            "number.integer": "El ID debe ser un número entero.",
            "number.positive": "El ID debe ser mayor a cero.",
            "any.required": "El parámetro 'id' es obligatorio."
        })
}).messages({
    "object.unknown": "No se permiten propiedades adicionales."
});