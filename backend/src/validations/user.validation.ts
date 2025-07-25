import Joi, { CustomHelpers, ObjectSchema } from 'joi';
import { validateRut } from '../helpers/rut.helper.js';

const allowedCorporateEmailDomains = ["gmail.com", "outlook.com", "hotmail.com", "gmail.cl", "outlook.cl", "hotmail.cl", "lamas.com", "live.cl"];
/* Custom validator for corporateEmail domains */
const domainCorporateEmailValidator = (value: string, helper: CustomHelpers) => {
  const isValid = allowedCorporateEmailDomains.some(domain => value.endsWith(domain));
  if (!isValid) return helper.message({ custom: "El dominio del correo corporativo no es válido." });
  return value;
};

/* Custom validator for RUT */
const rutValidator = (value: string, helper: CustomHelpers) => {
    if (!validateRut(value)) return helper.message({ custom: "El RUT ingresado no es válido." });
    return value;
}

/* Query validation for user search */
export const userQueryValidation: ObjectSchema = Joi.object({
    id: Joi.number()
        .integer()
        .min(1)
        .messages({
            "number.base": "El ID debe ser un número.",
            "number.integer": "El ID debe ser un número entero.",
            "number.min": "El ID debe ser mayor a 0."
        }),
    corporateEmail: Joi.string()
        .email()
        .messages({
            "string.base": "El correo corporativo debe ser una cadena de texto.",
            "string.email": "El correo corporativo debe tener un formato válido."
        }),
    rut: Joi.string()
        .custom((value, helpers) => {
            if (!validateRut(value)) {
                return helpers.error("any.invalid");
            }
            return value;
        })
        .messages({
            "string.base": "El RUT debe ser una cadena de texto.",
            "any.invalid": "El RUT no es válido."
        }),
    role: Joi.string()
        .valid("SuperAdministrador", "Administrador", "Usuario", "RecursosHumanos", "Gerencia", "Ventas", "Arriendo", "Finanzas", "Mecánico", "Mantenciones de Maquinaria")
        .messages({
            "string.base": "El rol debe ser una cadena de texto.",
            "any.only": "El rol especificado no es válido."
        })
})
    .or('id', 'corporateEmail', 'rut', 'role')
    .unknown(false)
    .messages({
        "object.unknown": "El objeto contiene campos no permitidos.",
        "object.missing": "Se requiere al menos uno de los siguientes campos: id, corporateEmail, rut, role."
    });

/* Validation of the body for creation or update */
export const userBodyValidation: ObjectSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(70)
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .messages({
            "string.base": "El nombre debe ser una cadena de texto.",
            "string.empty": "El nombre es requerido.",
            "string.min": "El nombre debe tener al menos {#limit} caracteres.",
            "string.max": "El nombre debe tener menos de {#limit} caracteres.",
            "string.pattern.base": "El nombre solo puede contener letras y espacios."
        }),
    corporateEmail: Joi.string()
        .email()
        .custom(domainCorporateEmailValidator, "domain corporateEmail validation")
        .messages({
            "string.base": "El correo corporativo debe ser una cadena de texto.",
            "string.email": "El correo corporativo debe tener un formato válido."
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
    password: Joi.string()
        .min(8)
        .max(16)
        .pattern(/^[a-zA-Z0-9]+$/)
        .messages({
            "string.base": "La contraseña debe ser una cadena de texto.",
            "string.min": "La contraseña debe tener al menos {#limit} caracteres.",
            "string.max": "La contraseña debe tener menos de {#limit} caracteres.",
            "string.pattern.base": "La contraseña solo puede contener letras y números."
        }),
    role: Joi.string()
        .valid("SuperAdministrador", "Administrador", "Usuario", "RecursosHumanos", "Gerencia", "Ventas", "Arriendo", "Finanzas", "Mecánico", "Mantenciones de Maquinaria")
        .messages({
            "string.base": "El rol debe ser una cadena de texto.",
            "any.only": "El rol especificado no es válido."
        })
})
    .or('name', 'corporateEmail', 'rut', 'password', 'role')
    .unknown(false)
    .messages({
        "object.unknown": "El objeto contiene campos no permitidos.",
        "object.missing": "Se requiere al menos uno de los siguientes campos: name, corporateEmail, rut, password o role."
    });