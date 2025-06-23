import Joi from "joi";

export const createSparePartValidation = Joi.object({
    name: Joi.string()
        .max(100)
        .required()
        .messages({
            "any.required": "El nombre del repuesto es obligatorio.",
            "string.base": "El nombre debe ser texto.",
            "string.max": "El nombre no debe superar los 100 caracteres."
        }),

    code: Joi.string()
        .max(100)
        .required()
        .messages({
            "any.required": "El código del repuesto es obligatorio.",
            "string.base": "El código debe ser texto.",
            "string.max": "El código no debe superar los 100 caracteres."
        }),

    stock: Joi.number()
        .integer()
        .min(0)
        .required()
        .messages({
            "any.required": "El stock es obligatorio.",
            "number.base": "El stock debe ser un número entero.",
            "number.integer": "El stock debe ser un número entero.",
            "number.min": "El stock no puede ser negativo."
        })
}).messages({
    "object.unknown": "No se permiten propiedades adicionales."
});

export const sparePartQueryValidation = Joi.object({
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
