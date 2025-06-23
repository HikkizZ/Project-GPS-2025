import Joi from "joi";

export const createMaintenanceHistoryValidation = Joi.object({
    maquinariaId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "any.required": "El ID de la maquinaria es obligatorio.",
            "number.base": "El ID debe ser un número.",
            "number.integer": "El ID debe ser un número entero.",
            "number.positive": "El ID debe ser mayor a cero."
        }),

    date: Joi.date()
        .required()
        .messages({
            "any.required": "La fecha es obligatoria.",
            "date.base": "Debe ser una fecha válida."
        }),

    description: Joi.string()
        .max(255)
        .required()
        .messages({
            "any.required": "La descripción es obligatoria.",
            "string.base": "La descripción debe ser texto.",
            "string.max": "La descripción no debe superar los 255 caracteres."
        }),

    cost: Joi.number()
        .positive()
        .required()
        .messages({
            "any.required": "El costo es obligatorio.",
            "number.base": "El costo debe ser un número.",
            "number.positive": "El costo debe ser mayor a cero."
        }),

    responsibleMechanic: Joi.string()
        .max(200)
        .required()
        .messages({
            "any.required": "El nombre del mecánico es obligatorio.",
            "string.base": "El nombre debe ser texto.",
            "string.max": "El nombre no debe superar los 200 caracteres."
        })
}).messages({
    "object.unknown": "No se permiten propiedades adicionales."
});

export const maintenanceHistoryQueryValidation = Joi.object({
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
