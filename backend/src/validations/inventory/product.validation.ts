import Joi from "joi";
import { ProductType } from '../../types/index.js';

export const createProductValidation = Joi.object({
    product: Joi.string()
        .valid(...Object.values(ProductType))
        .required()
        .messages({
            "any.required": "El tipo de producto es obligatorio.",
            "any.only": "El tipo de producto no es válido.",
            "string.base": "El tipo de producto debe ser una cadena de texto.",
        }),

    salePrice: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "any.required": "El precio de venta es obligatorio.",
            "number.base": "El precio de venta debe ser un número.",
            "number.integer": "El precio de venta debe ser un número entero.",
            "number.positive": "El precio de venta debe ser mayor a cero.",
        }),
});

export const updateProductValidation = Joi.object({
    product: Joi.string()
        .valid(...Object.values(ProductType))
        .messages({
            "any.only": "El tipo de producto no es válido.",
            "string.base": "El tipo de producto debe ser una cadena de texto.",
        }),

    salePrice: Joi.number()
        .integer()
        .positive()
        .messages({
            "number.base": "El precio de venta debe ser un número.",
            "number.integer": "El precio de venta debe ser un número entero.",
            "number.positive": "El precio de venta debe ser mayor a cero.",
        })

}).or("product", "salePrice").messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.base": "El cuerpo de la solicitud debe ser un objeto.",
    "object.empty": "El cuerpo de la solicitud no puede estar vacío.",
    "object.missing": "Se requiere al menos una propiedad para actualizar."
});

export const productQueryValidation = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "El ID del producto debe ser un número.",
            "number.integer": "El ID del producto debe ser un número entero.",
            "number.positive": "El ID del producto debe ser mayor a cero.",
            "any.required": "El ID del producto es obligatorio.",
        }),
}).or("id").messages({
    "object.unknown": "No se permiten propiedades adicionales."
});