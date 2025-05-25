import Joi from "joi";

export const FailureReport = Joi.object({

    maquinariaId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "any.required": "El ID de la maquinaria es obligatorio.",
        }),
        
    date: Joi.date()
        .required()
        .messages({
            "any.required": "La fecha del fallo es obligatoria.",
        }),

    description: Joi.string()
        .max(150)
        .required()
        .messages({
            "any.required": "La descripción del fallo es obligatoria.",
        }),

    resolved: Joi.boolean()
        .messages({
            "boolean.base": "El campo 'resolved' debe ser booleano.",
        })


})