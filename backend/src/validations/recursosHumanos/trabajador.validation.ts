import Joi from "joi";
import { validateRut } from "../../helpers/rut.helper.js";

export const TrabajadorQueryValidation = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .messages({
            "number.base": "El ID debe ser un número.",
            "number.integer": "El ID debe ser un número entero.",
            "number.positive": "El ID debe ser un número positivo."
        }),

    rut: Joi.string()
        .min(7)
        .max(12)
        .messages({
            "string.base": "El RUT debe ser una cadena de texto.",
            "string.min": "El RUT debe tener al menos 7 caracteres.",
            "string.max": "El RUT no puede exceder los 12 caracteres."
        }),

    nombres: Joi.string()
        .min(1)
        .max(100)
        .messages({
            "string.base": "Los nombres deben ser una cadena de texto.",
            "string.min": "Los nombres deben tener al menos 1 carácter.",
            "string.max": "Los nombres no pueden exceder los 100 caracteres."
        }),

    apellidoPaterno: Joi.string()
        .min(1)
        .max(100)
        .messages({
            "string.base": "El apellido paterno debe ser una cadena de texto.",
            "string.min": "El apellido paterno debe tener al menos 1 carácter.",
            "string.max": "El apellido paterno no puede exceder los 100 caracteres."
        }),

    apellidoMaterno: Joi.string()
        .min(1)
        .max(100)
        .messages({
            "string.base": "El apellido materno debe ser una cadena de texto.",
            "string.min": "El apellido materno debe tener al menos 1 carácter.",
            "string.max": "El apellido materno no puede exceder los 100 caracteres."
        }),

    fechaNacimiento: Joi.date()
        .iso()
        .messages({
            "date.base": "La fecha de nacimiento debe ser una fecha válida.",
            "date.format": "La fecha de nacimiento debe estar en formato YYYY-MM-DD."
        }),

    telefono: Joi.string()
        .pattern(/^\+?[\d]{3,12}$/)
        .messages({
            "string.base": "El teléfono debe ser una cadena de texto.",
            "string.pattern.base": "El teléfono debe tener entre 3 y 12 dígitos y puede incluir el símbolo +."
        }),

    correoPersonal: Joi.string()
        .email()
        .messages({
            "string.base": "El correo personal debe ser una cadena de texto.",
            "string.email": "El correo personal debe tener un formato válido."
        }),

    numeroEmergencia: Joi.string()
        .pattern(/^\+?[\d]{3,12}$/)
        .messages({
            "string.base": "El número de emergencia debe ser una cadena de texto.",
            "string.pattern.base": "El número de emergencia debe tener entre 3 y 12 dígitos y puede incluir el símbolo +."
        }),

            direccion: Joi.string()
        .min(2)
        .max(200)
        .messages({
            "string.base": "La dirección debe ser una cadena de texto.",
            "string.min": "La dirección debe tener al menos 2 caracteres.",
            "string.max": "La dirección no puede exceder los 200 caracteres."
        }),

    fechaIngreso: Joi.date()
        .iso()
        .messages({
            "date.base": "La fecha de ingreso debe ser una fecha válida.",
            "date.format": "La fecha de ingreso debe estar en formato YYYY-MM-DD."
        }),

    enSistema: Joi.alternatives()
        .try(Joi.boolean(), Joi.string().valid("true", "false"))
        .messages({
            "alternatives.types": "El campo enSistema debe ser booleano (true o false)."
        }),

    todos: Joi.boolean()
        .optional()
        .messages({
            "boolean.base": "El campo 'todos' debe ser true o false."
    }),

    soloEliminados: Joi.boolean()
        .optional()
        .messages({
            "boolean.base": "El campo 'soloEliminados' debe ser true o false."
    })
});

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

    correoPersonal: Joi.string()
        .email()
        .required()
        .messages({
            "string.base": "El correo personal debe ser una cadena de texto.",
            "string.email": "El correo personal debe tener un formato válido.",
            "any.required": "El correo personal es requerido."
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

export const TrabajadorUpdateValidation = Joi.object({
    nombres: Joi.string()
        .min(3)
        .max(200)
        .messages({
            "string.base": "Los nombres deben ser una cadena de texto.",
            "string.min": "Los nombres deben tener al menos 3 caracteres.",
            "string.max": "Los nombres no pueden exceder los 200 caracteres."
        }),

    apellidoPaterno: Joi.string()
        .min(3)
        .max(100)
        .messages({
            "string.base": "El apellido paterno debe ser una cadena de texto.",
            "string.min": "El apellido paterno debe tener al menos 3 caracteres.",
            "string.max": "El apellido paterno no puede exceder los 100 caracteres."
        }),

    apellidoMaterno: Joi.string()
        .min(3)
        .max(100)
        .messages({
            "string.base": "El apellido materno debe ser una cadena de texto.",
            "string.min": "El apellido materno debe tener al menos 3 caracteres.",
            "string.max": "El apellido materno no puede exceder los 100 caracteres."
        }),

    telefono: Joi.string()
        .pattern(/^\+?[\d]{9,12}$/)
        .messages({
            "string.base": "El teléfono debe ser una cadena de texto.",
            "string.pattern.base": "El teléfono debe tener entre 9 y 12 dígitos y puede incluir el símbolo +."
        }),

    numeroEmergencia: Joi.string()
        .pattern(/^\+?[\d]{9,12}$/)
        .messages({
            "string.base": "El número de emergencia debe ser una cadena de texto.",
            "string.pattern.base": "El número de emergencia debe tener entre 9 y 12 dígitos y puede incluir el símbolo +."
        }),

    direccion: Joi.string()
        .min(2)
        .max(200)
        .messages({
            "string.base": "La dirección debe ser una cadena de texto.",
            "string.min": "La dirección debe tener al menos 2 caracteres.",
            "string.max": "La dirección no puede exceder los 200 caracteres."
        }),

    rut: Joi.any().forbidden().messages({
        "any.unknown": "No se puede modificar el RUT"
    }),

    correoPersonal: Joi.string()
        .email()
        .messages({
            "string.base": "El correo personal debe ser una cadena de texto.",
            "string.email": "El correo personal debe tener un formato válido."
        }),

    fechaIngreso: Joi.any().forbidden().messages({
        "any.unknown": "No se puede modificar la fecha de ingreso"
    }),

    fechaNacimiento: Joi.any().forbidden().messages({
        "any.unknown": "No se puede modificar la fecha de nacimiento"
    })
}).min(1).messages({
    "object.min": "Debe proporcionar al menos un campo para actualizar"
});