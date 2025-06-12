import Joi, { CustomHelpers } from 'joi';
import { validateRut } from '../helpers/rut.helper.js';

const allowedEmailDomains = ["gmail.com", "outlook.com", "hotmail.com", "gmail.cl", "outlook.cl", "hotmail.cl", "lamas.com"];
const allowedRoles = ["SuperAdministrador", "Administrador", "Usuario", "RecursosHumanos", "Gerencia", "Ventas", "Arriendo", "Finanzas"];

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
        .min(15)
        .max(50)
        .email()
        .required()
        .messages({
            "string.base": "El email debe ser de tipo texto.",
            "string.empty": "El campo del email no puede estar vacío.",
            "string.email": "El email ingresado no es válido.",
            "string.min": "El email debe tener al menos 15 caracteres.",
            "string.max": "El email debe tener menos de 50 caracteres.",
            "any.required": "El email es requerido."
        })
        .custom(domainEmailValidator, "domain email validation"),

    password: Joi.string()
        .min(8)
        .max(16)
        .required()
        .pattern(/^[a-zA-Z0-9]+$/)
        .messages({
            "string.base": "La contraseña debe ser de tipo texto.",
            "string.empty": "El campo de la contraseña no puede estar vacío.",
            "string.min": "La contraseña debe tener al menos 8 caracteres.",
            "string.max": "La contraseña debe tener menos de 16 caracteres.",
            "any.required": "La contraseña es requerida.",
            "string.pattern.base": "La contraseña solo puede contener letras y números."
        }),
}).messages({
    "object.unknown": "El objeto contiene campos no permitidos."
});

/* Register validation */
export const registerValidation = Joi.object({
    name: Joi.string()
        .min(3)
        .max(70)
        .pattern(/^[a-zA-Z\s]+$/)
        .required()
        .messages({
            "string.base": "El nombre debe ser de tipo texto.",
            "string.empty": "El campo del nombre no puede estar vacío.",
            "string.min": "El nombre debe tener al menos 3 caracteres.",
            "string.max": "El nombre debe tener menos de 70 caracteres.",
            "any.required": "El nombre es requerido.",
            "string.pattern.base": "El nombre solo puede contener letras y espacios."
        }),
    
    rut: Joi.string()
        .min(8)
        .max(12)
        .required()
        .custom(rutValidator, "rut validation")
        .messages({
            "string.base": "El RUT debe ser de tipo texto.",
            "string.empty": "El campo del RUT no puede estar vacío.",
            "string.min": "El RUT debe tener al menos 8 caracteres.",
            "string.max": "El RUT debe tener menos de 12 caracteres.",
            "any.required": "El RUT es requerido.",
            "any.custom": "El RUT ingresado no es válido."
        }),

    email: Joi.string()
        .min(15)
        .max(50)
        .email()
        .required()
        .messages({
            "string.base": "El email debe ser de tipo texto.",
            "string.empty": "El campo del email no puede estar vacío.",
            "string.email": "El email ingresado no es válido.",
            "string.min": "El email debe tener al menos 15 caracteres.",
            "string.max": "El email debe tener menos de 50 caracteres.",
            "any.required": "El email es requerido."
        })
        .custom(domainEmailValidator, "domain email validation"),
    
    password: Joi.string()
        .min(8)
        .max(16)
        .required()
        .pattern(/^[a-zA-Z0-9]+$/)
        .messages({
            "string.base": "La contraseña debe ser de tipo texto.",
            "string.empty": "El campo de la contraseña no puede estar vacío.",
            "string.min": "La contraseña debe tener al menos 8 caracteres.",
            "string.max": "La contraseña debe tener menos de 16 caracteres.",
            "any.required": "La contraseña es requerida.",
            "string.pattern.base": "La contraseña solo puede contener letras y números."
        }),

    role: Joi.string()
        .valid(...allowedRoles)
        .required()
        .messages({
            "string.base": "El rol debe ser de tipo texto.",
            "string.empty": "El campo del rol no puede estar vacío.",
            "any.required": "El rol es requerido.",
            "any.only": "El rol debe ser uno de los roles permitidos."
        })
}).messages({
    "object.unknown": "El objeto contiene campos no permitidos."
});