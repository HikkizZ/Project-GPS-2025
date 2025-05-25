import Joi from "joi";

export const SparePart = Joi.object({

    name: Joi.string()
        .max(100)
        .required()
        .messages({
            "any.required": "El nombre del repuesto es obligatorio.",
        }),

    code: Joi.string()
        .max(100)
        .required()
        .messages({
            "any.required": "El código del repuesto es obligatorio.",
        }),

    stock: Joi.number()
        .integer()
        .min(0)
        .required()
        .messages({
            "any.required": "El stock es obligatorio.",
            "number.base": "El stock debe ser un número entero.",
            "number.min": "El stock no puede ser negativo.",
        })



})