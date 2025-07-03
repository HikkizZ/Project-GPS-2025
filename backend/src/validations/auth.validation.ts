import Joi, { CustomHelpers } from 'joi';
import { validateRut } from '../helpers/rut.helper.js';

const allowedEmailDomains = ["gmail.com", "outlook.com", "hotmail.com", "gmail.cl", "outlook.cl", "hotmail.cl", "lamas.com", "live.cl"];
const allowedRoles = ["SuperAdministrador", "Administrador", "Usuario", "RecursosHumanos", "Gerencia", "Ventas", "Arriendo", "Finanzas", "Mecánico", "Mantenciones de Maquinaria", "Conductor"];

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