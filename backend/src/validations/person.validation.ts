import Joi, { CustomHelpers, ObjectSchema }from "joi";
import { validateRut } from "../helpers/rut.helper.js";

const allowedEmailDomains = ["gmail.com", "outlook.com", "hotmail.com", "gmail.cl", "outlook.cl", "hotmail.cl", "lamas.com"];

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

/* Query validation for person search */
export const personQueryValidation: ObjectSchema = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .messages({
            "number.base": "El ID debe ser un número.",
            "number.integer": "El ID debe ser un número entero.",
            "number.positive": "El ID debe ser un número positivo."
        }),
    email: Joi.string()
        .min(15)
        .max(50)
        .email()
        .custom(domainEmailValidator, "domain email validation")
        .messages({
            "string.base": "El email debe ser de tipo texto.",
            "string.empty": "El campo del email no puede estar vacío.",
            "string.email": "El email ingresado no es válido.",
            "string.min": "El email debe tener al menos 15 caracteres.",
            "string.max": "El email debe tener menos de 50 caracteres."
        }),
    rut: Joi.string()
        .min(8)
        .max(12)
        .custom(rutValidator, "rut validation")
        .messages({
            "string.base": "El RUT debe ser de tipo texto.",
            "string.empty": "El campo del RUT no puede estar vacío.",
            "string.min": "El RUT debe tener al menos 8 caracteres.",
            "string.max": "El RUT debe tener menos de 12 caracteres."
        })
}).or('id', 'email', 'rut')
    .unknown(false)
    .messages({
        "object.unknown": "El objeto contiene campos no permitidos.",
        "object.missing": "Se requiere al menos uno de los siguientes campos: id, email o rut."
    });

/* User creation validation */
export const personBodyValidation: ObjectSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(70)
        .pattern(/^[a-zA-ZÁÉÍÓÚÑáéíóúñ0-9 &\-\/\.\s]+$/) 
        .required()
        .messages({
            "string.base": "El nombre debe ser de tipo texto.",
            "string.empty": "El campo del nombre no puede estar vacío.",
            "string.min": "El nombre debe tener al menos 3 caracteres.",
            "string.max": "El nombre debe tener menos de 70 caracteres.",
            "any.required": "El nombre es requerido.",
            "string.pattern.base": "El nombre solo puede contener letras, números y algunos caracteres especiales."
        }),
    rut: Joi.string()
        .min(8)
        .max(12)
        .custom(rutValidator, "rut validation")
        .messages({
            "string.base": "El RUT debe ser de tipo texto.",
            "string.empty": "El campo del RUT no puede estar vacío.",
            "string.min": "El RUT debe tener al menos 8 caracteres.",
            "string.max": "El RUT debe tener menos de 12 caracteres.",
            "any.required": "El RUT es requerido."
        }),
    address: Joi.string()
        .min (5)
        .max(255)
        .required()
        .pattern(/^[a-zA-ZÁÉÍÓÚÑáéíóúñ0-9\s.,#\-\/°º]+$/)
        .messages({
            "string.base": "La dirección debe ser de tipo texto.",
            "string.empty": "El campo de la dirección no puede estar vacío.",
            "string.min": "La dirección debe tener al menos 5 caracteres.",
            "string.max": "La dirección debe tener menos de 255 caracteres.",
            "any.required": "La dirección es requerida.",
            "string.pattern.base": "La dirección solo puede contener letras, números y algunos caracteres especiales."
        }),
    phone: Joi.string()
        .min(9)
        .max(13)
        .required()
        .pattern(/^(\+?56)?(9\d{8}|[2-9]\d{8})$/)
        .messages({
            "string.base": "El teléfono debe ser de tipo texto.",
            "string.empty": "El campo del teléfono no puede estar vacío.",
            "string.min": "El teléfono debe tener al menos 9 caracteres.",
            "string.max": "El teléfono debe tener menos de 13 caracteres.",
            "any.required": "El teléfono es requerido.",
            "string.pattern.base": "El número debe ser un teléfono chileno válido, fijo o celular."
        }),
        email: Joi.string()
        .min(15)
        .max(50)
        .email()
        .custom(domainEmailValidator, "domain email validation")
        .messages({
            "string.base": "El email debe ser de tipo texto.",
            "string.empty": "El campo del email no puede estar vacío.",
            "string.email": "El email ingresado no es válido.",
            "string.min": "El email debe tener al menos 15 caracteres.",
            "string.max": "El email debe tener menos de 50 caracteres.",
            "any.required": "El email es requerido."
        })
}).or('name', 'rut', 'address', 'phone', 'email')
    .unknown(false)
    .messages({
        "object.unknown": "El objeto contiene campos no permitidos.",
        "object.missing": "Se requiere al menos uno de los siguientes campos: name, rut, address, phone o email."
    });
