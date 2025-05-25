import Joi from "joi";

export const ScheduledMaintenance = Joi.object({

    maquinariaId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "any.required": "El ID de la maquinaria es obligatorio.",
        }),
        
     scheduledDate: Joi.date()
        .required()
        .messages({
            "any.required": "La fecha programada es obligatoria.",
            "date.base": "Debe ser una fecha válida.",
        }),

    task: Joi.string()
        .max(150)
        .required()
        .messages({
            "any.required": "La tarea es obligatoria.",
            "string.base": "La tarea debe ser una cadena de texto.",
            "string.max": "La tarea no debe superar los 150 caracteres.",
        }),

    completed: Joi.boolean()
        .messages({
            "boolean.base": "El campo 'completed' debe ser booleano.",
        })


})