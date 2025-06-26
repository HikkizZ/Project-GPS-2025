import Joi, { CustomHelpers } from 'joi';
import { validateRut } from '../helpers/rut.helper.js';

const allowedEmailDomains = ["gmail.com", "outlook.com", "hotmail.com", "gmail.cl", "outlook.cl", "hotmail.cl", "lamas.com", "live.cl"];
const allowedRoles = ["SuperAdministrador", "Administrador", "Usuario", "RecursosHumanos", "Gerencia", "Ventas", "Arriendo", "Finanzas", "Mecánico", "Mantenciones de Maquinaria"];

/* Custom validator for email domains */
const domainEmailValidator = (value: string, helper: CustomHelpers) => {
    const isValid = allowedEmailDomains.some(domain => value.endsWith(domain));
    if (!isValid) return helper.message({ custom: "El dominio del email no es válido." });
}

/* Custom validator for RUT */
const rutValidator = (value: string, helper: CustomHelpers) => {
    if (!validateRut(value)) return helper.message({ custom: "El RUT ingresado no es válido." });
    return value;
}

/* Login validation */
export const authValidation = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.base": "El email debe ser una cadena de texto.",
            "string.empty": "El email es requerido.",
            "string.email": "El email debe tener un formato válido.",
            "any.required": "El email es requerido."
        }),
    password: Joi.string()
        .required()
        .messages({
            "string.base": "La contraseña debe ser una cadena de texto.",
            "string.empty": "La contraseña es requerida.",
            "any.required": "La contraseña es requerida."
        })
});

/* Register validation */
export const registerValidation = Joi.object({
    name: Joi.string()
        .required()
        .min(3)
        .max(70)
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .messages({
            "string.base": "El nombre debe ser una cadena de texto.",
            "string.empty": "El nombre es requerido.",
            "string.min": "El nombre debe tener al menos {#limit} caracteres.",
            "string.max": "El nombre debe tener menos de {#limit} caracteres.",
            "string.pattern.base": "El nombre solo puede contener letras y espacios.",
            "any.required": "El nombre es requerido."
        }),
    rut: Joi.string()
        .when('role', {
            is: 'SuperAdministrador',
            then: Joi.optional(),
            otherwise: Joi.string()
                .required()
                .custom((value, helpers) => {
                    if (!validateRut(value)) {
                        return helpers.error("any.invalid");
                    }
                    return value;
                })
                .messages({
                    "string.base": "El RUT debe ser una cadena de texto.",
                    "string.empty": "El RUT es requerido.",
                    "any.required": "El RUT es requerido.",
                    "any.invalid": "El RUT no es válido."
                })
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.base": "El email debe ser una cadena de texto.",
            "string.empty": "El email es requerido.",
            "string.email": "El email debe tener un formato válido.",
            "any.required": "El email es requerido."
        }),
    password: Joi.string()
        .required()
        .min(8)
        .max(16)
        .pattern(/^[a-zA-Z0-9]+$/)
        .messages({
            "string.base": "La contraseña debe ser una cadena de texto.",
            "string.empty": "La contraseña es requerida.",
            "string.min": "La contraseña debe tener al menos {#limit} caracteres.",
            "string.max": "La contraseña debe tener menos de {#limit} caracteres.",
            "string.pattern.base": "La contraseña solo puede contener letras y números.",
            "any.required": "La contraseña es requerida."
        }),
    role: Joi.string()
        .valid("SuperAdministrador", "Administrador", "Usuario", "RecursosHumanos", "Gerencia", "Ventas", "Arriendo", "Finanzas", "Mecánico", "Mantenciones de Maquinaria")
        .required()
        .messages({
            "string.base": "El rol debe ser una cadena de texto.",
            "string.empty": "El rol es requerido.",
            "any.only": "El rol especificado no es válido.",
            "any.required": "El rol es requerido."
        })
});