import Joi from "joi";

export const createRefuelingRecordValidation = Joi.object({
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

    liters: Joi.number()
        .positive()
        .required()
        .messages({
            "any.required": "Los litros son obligatorios.",
            "number.base": "Los litros deben ser un número.",
            "number.positive": "Los litros deben ser mayores a cero."
        }),

    price: Joi.number()
        .positive()
        .required()
        .messages({
            "any.required": "El precio es obligatorio.",
            "number.base": "El precio debe ser un número.",
            "number.positive": "El precio debe ser mayor a cero."
        }),

    operator: Joi.string()
        .max(100)
        .required()
        .messages({
            "any.required": "El operador es obligatorio.",
            "string.base": "El operador debe ser texto.",
            "string.max": "El nombre del operador no debe superar los 100 caracteres."
        })
}).messages({
    "object.unknown": "No se permiten propiedades adicionales."
});

export const refuelingRecordQueryValidation = Joi.object({
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