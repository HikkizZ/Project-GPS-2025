import Joi from "joi";

export const RefuelingRecord = Joi.object({


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
            "any.required": "La fecha es obligatoria.",
            "date.base": "Debe ser una fecha válida.",
        }),

    liters: Joi.number()
        .positive()
        .required()
        .messages({
            "any.required": "Los litros cargados son obligatorios.",
            "number.base": "Los litros deben ser un número.",
            "number.positive": "Los litros deben ser mayores a cero.",
        }),

    operator: Joi.string()
        .max(100)
        .required()
        .messages({
            "any.required": "El nombre del operador es obligatorio.",
        })

    
})