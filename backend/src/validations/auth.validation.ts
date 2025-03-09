import Joi, { CustomHelpers } from 'joi';

/* Custom validator for email domains */
const domainEmailValidator = (value: string, helper: CustomHelpers) => {
    if (!value.endsWith("@gmail.com")) return helper.message({ custom: "El email debe ser de dominio gmail.com." });
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
        .optional()
        .pattern(/^\d{1,2}(\.\d{3}){2}-[\dkK]$|^\d{7,8}-[\dkK]$/)
        .messages({
            "string.base": "El RUT debe ser de tipo texto.",
            "string.empty": "El campo del RUT no puede estar vacío.",
            "string.min": "El RUT debe tener al menos 8 caracteres.",
            "string.max": "El RUT debe tener menos de 12 caracteres.",
            "string.pattern.base": "El RUT ingresado no es válido.",
            "any.required": "El RUT es requerido."
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
        })
}).messages({
    "object.unknown": "El objeto contiene campos no permitidos."
});