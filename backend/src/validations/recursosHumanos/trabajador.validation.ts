import Joi from "joi";
import { validateRut } from "../../helpers/rut.helper.js";

export const TrabajadorBodyValidation = Joi.object({
    nombre: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            "string.base": "El nombre debe ser una cadena de texto.",
            "string.min": "El nombre debe tener al menos 3 caracteres.",
            "string.max": "El nombre no puede exceder los 100 caracteres.",
            "any.required": "El nombre es requerido."
        }),

    rut: Joi.string()
        .required()
        .custom((value, helpers) => {
            if (!validateRut(value)) {
                return helpers.error("any.invalid");
            }
            return value;
        })
        .messages({
            "string.base": "El RUT debe ser una cadena de texto.",
            "any.required": "El RUT es requerido.",
            "any.invalid": "El RUT no es válido."
        }),

    fechaNacimiento: Joi.date()
        .iso()
        .max('now')
        .required()
        .messages({
            "date.base": "La fecha de nacimiento debe ser una fecha válida.",
            "date.format": "La fecha de nacimiento debe estar en formato YYYY-MM-DD",
            "date.max": "La fecha de nacimiento no puede ser futura.",
            "any.required": "La fecha de nacimiento es requerida."
        }),

    direccion: Joi.string()
        .min(5)
        .max(200)
        .required()
        .messages({
            "string.base": "La dirección debe ser una cadena de texto.",
            "string.min": "La dirección debe tener al menos 5 caracteres.",
            "string.max": "La dirección no puede exceder los 200 caracteres.",
            "any.required": "La dirección es requerida."
        }),

    telefono: Joi.string()
        .pattern(/^\+?56?\d{9}$/)
        .required()
        .messages({
            "string.base": "El teléfono debe ser una cadena de texto.",
            "string.pattern.base": "El teléfono debe ser un número válido con formato +56912345678 o 912345678.",
            "any.required": "El teléfono es requerido."
        }),

    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.base": "El email debe ser una cadena de texto.",
            "string.email": "El email debe tener un formato válido.",
            "any.required": "El email es requerido."
        }),

    contactoEmergencia: Joi.object({
        nombre: Joi.string()
            .min(3)
            .max(100)
            .required()
            .messages({
                "string.base": "El nombre del contacto debe ser una cadena de texto.",
                "string.min": "El nombre del contacto debe tener al menos 3 caracteres.",
                "string.max": "El nombre del contacto no puede exceder los 100 caracteres.",
                "any.required": "El nombre del contacto es requerido."
            }),

        telefono: Joi.string()
            .pattern(/^\+?56?\d{9}$/)
            .required()
            .messages({
                "string.base": "El teléfono del contacto debe ser una cadena de texto.",
                "string.pattern.base": "El teléfono del contacto debe ser un número válido con formato +56912345678 o 912345678.",
                "any.required": "El teléfono del contacto es requerido."
            }),

        relacion: Joi.string()
            .min(3)
            .max(50)
            .required()
            .messages({
                "string.base": "La relación debe ser una cadena de texto.",
                "string.min": "La relación debe tener al menos 3 caracteres.",
                "string.max": "La relación no puede exceder los 50 caracteres.",
                "any.required": "La relación es requerida."
            })
    }).required().messages({
        "any.required": "Los datos de contacto de emergencia son requeridos."
    })
}); 