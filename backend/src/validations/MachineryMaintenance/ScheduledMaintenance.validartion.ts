import Joi from "joi";

export const createScheduledMaintenanceValidation = Joi.object({
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

    scheduleDate: Joi.date()
        .required()
        .messages({
            "any.required": "La fecha programada es obligatoria.",
            "date.base": "Debe ser una fecha válida."
        }),

    task: Joi.string()
        .max(255)
        .required()
        .messages({
            "any.required": "La tarea es obligatoria.",
            "string.base": "La tarea debe ser texto.",
            "string.max": "La tarea no debe superar los 255 caracteres."
        }),

    completed: Joi.boolean()
        .messages({
            "boolean.base": "El campo 'completed' debe ser booleano."
        })
}).messages({
    "object.unknown": "No se permiten propiedades adicionales."
});

export const scheduledMaintenanceQueryValidation = Joi.object({
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