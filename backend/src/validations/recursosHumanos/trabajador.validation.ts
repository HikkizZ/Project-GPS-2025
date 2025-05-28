import Joi from "joi";
import { validateRut } from "../../helpers/rut.helper.js";

export const TrabajadorBodyValidation = Joi.object({
    nombres: Joi.string()
        .min(3)
        .max(200)
        .required()
        .messages({
            "string.base": "Los nombres deben ser una cadena de texto.",
            "string.min": "Los nombres deben tener al menos 3 caracteres.",
            "string.max": "Los nombres no pueden exceder los 200 caracteres.",
            "any.required": "Los nombres son requeridos (primer y segundo nombre si aplica)."
        }),

    apellidoPaterno: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            "string.base": "El apellido paterno debe ser una cadena de texto.",
            "string.min": "El apellido paterno debe tener al menos 3 caracteres.",
            "string.max": "El apellido paterno no puede exceder los 100 caracteres.",
            "any.required": "El apellido paterno es requerido."
        }),

    apellidoMaterno: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            "string.base": "El apellido materno debe ser una cadena de texto.",
            "string.min": "El apellido materno debe tener al menos 3 caracteres.",
            "string.max": "El apellido materno no puede exceder los 100 caracteres.",
            "any.required": "El apellido materno es requerido."
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

    correo: Joi.string()
        .email()
        .required()
        .messages({
            "string.base": "El correo debe ser una cadena de texto.",
            "string.email": "El correo debe tener un formato válido.",
            "any.required": "El correo es requerido."
        }),

    telefono: Joi.string()
        .pattern(/^\+?[\d]{9,12}$/)
        .required()
        .messages({
            "string.base": "El teléfono debe ser una cadena de texto.",
            "string.pattern.base": "El teléfono debe tener entre 9 y 12 dígitos y puede incluir el símbolo +.",
            "any.required": "El teléfono es requerido."
        }),

    numeroEmergencia: Joi.string()
        .pattern(/^\+?[\d]{9,12}$/)
        .optional()
        .messages({
            "string.base": "El número de emergencia debe ser una cadena de texto.",
            "string.pattern.base": "El número de emergencia debe tener entre 9 y 12 dígitos y puede incluir el símbolo +."
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

    fechaIngreso: Joi.date()
        .iso()
        .required()
        .messages({
            "date.base": "La fecha de ingreso debe ser una fecha válida.",
            "date.format": "La fecha de ingreso debe estar en formato YYYY-MM-DD",
            "any.required": "La fecha de ingreso es requerida."
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

    fichaEmpresa: Joi.object({
        cargo: Joi.string().optional(),
        area: Joi.string().optional(),
        empresa: Joi.string().optional(),
        tipoContrato: Joi.string().optional(),
        jornadaLaboral: Joi.string().optional(),
        sueldoBase: Joi.number().optional(),
        contratoURL: Joi.string().optional()
    }).optional()
}); 