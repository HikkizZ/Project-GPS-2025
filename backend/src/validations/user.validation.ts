import Joi, { CustomHelpers, ObjectSchema } from 'joi';
import { validateRut } from '../helpers/rut.helper.js';

const allowedEmailDomains = ["gmail.com", "outlook.com", "hotmail.com", "gmail.cl", "outlook.cl", "hotmail.cl", "lamas.com", "live.cl"];
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

/* Query validation for user search */
export const userQueryValidation: ObjectSchema = Joi.object({
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
        }),
    role: Joi.string()
        .valid("Administrador", "RecursosHumanos", "Usuario", "Gerencia", "Ventas", "Arriendo", "Finanzas", "Mecánico", "Mantenciones de Maquinaria")
        .messages({
            "string.base": "El rol debe ser de tipo texto.",
            "any.only": "El rol debe ser uno de los roles permitidos."
        }),
    name: Joi.string()
        .min(3)
        .max(70)
        .pattern(/^[a-zA-Z\s]+$/)
        .messages({
            "string.base": "El nombre debe ser de tipo texto.",
            "string.min": "El nombre debe tener al menos 3 caracteres.",
            "string.max": "El nombre debe tener menos de 70 caracteres.",
            "string.pattern.base": "El nombre solo puede contener letras y espacios."
        })
})
    .or('id', 'email', 'rut', 'role', 'name')
    .unknown(false)
    .messages({
        "object.unknown": "El objeto contiene campos no permitidos.",
        "object.missing": "Se requiere al menos uno de los siguientes campos: id, email, rut, role o name."
    });

/* Validation of the body for creation or update */
export const userBodyValidation: ObjectSchema = Joi.object({
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
            "any.required": "El nombre es requerido."
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
        }),
    rut: Joi.alternatives().conditional('role', {
        is: 'SuperAdministrador',
        then: Joi.string().optional().allow(null),
        otherwise: Joi.string()
            .min(8)
            .max(12)
            .custom(rutValidator, "rut validation")
            .messages({
                "string.base": "El RUT debe ser de tipo texto.",
                "string.empty": "El campo del RUT no puede estar vacío.",
                "string.min": "El RUT debe tener al menos 8 caracteres.",
                "string.max": "El RUT debe tener menos de 12 caracteres.",
                "any.required": "El RUT es requerido."
            })
    }),
    password: Joi.string()
        .min(8)
        .max(16)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,16}$/)
        .messages({
            "string.base": "La contraseña debe ser de tipo texto.",
            "string.empty": "El campo de la contraseña no puede estar vacío.",
            "string.min": "La contraseña debe tener al menos 8 caracteres.",
            "string.max": "La contraseña debe tener menos de 16 caracteres.",
            "string.pattern.base": "La contraseña debe tener al menos una mayúscula, una minúscula, un número y un carácter especial."
        }),
    newPassword: Joi.string()
        .min(8)
        .max(16)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,16}$/)
        .messages({
            "string.base": "La nueva contraseña debe ser de tipo texto.",
            "string.empty": "El campo de la nueva contraseña no puede estar vacío.",
            "string.min": "La nueva contraseña debe tener al menos 8 caracteres.",
            "string.max": "La nueva contraseña debe tener menos de 16 caracteres.",
            "string.pattern.base": "La nueva contraseña debe tener al menos una mayúscula, una minúscula, un número y un carácter especial."
        }),
    role: Joi.string()
        .min(3)
        .max(30)
        .messages({
            "string.base": "El rol debe ser de tipo texto.",
            "string.empty": "El campo del rol no puede estar vacío.",
            "string.min": "El rol debe tener al menos 3 caracteres.",
            "string.max": "El rol debe tener menos de 30 caracteres."
        })
})
    .or('name', 'email', 'rut', 'password', 'newPassword', 'role')
    .unknown(false)
    .messages({
        "object.unknown": "El objeto contiene campos no permitidos.",
        "object.missing": "Se requiere al menos uno de los siguientes campos: name, email, rut, password, newPassword o role."
    });