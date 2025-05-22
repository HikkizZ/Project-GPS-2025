import Joi, { CustomHelpers } from "joi";
import { EstadoTrabajador } from "../entity/trabajador.js";
import { validateRut } from "../helpers/rut.helper.js";

// Validador personalizado para RUT chileno
const rutValidator = (value: string, helper: CustomHelpers) => {
  if (!validateRut(value)) {
    return helper.message({ custom: "El RUT ingresado no es válido." });
  }
  return value;
};

export const trabajadorValidation = Joi.object({
  // Identificación
  rut: Joi.string()
    .min(8)
    .max(12)
    .required()
    .custom(rutValidator, "rut validation")
    .messages({
      "string.base": "El RUT debe ser texto.",
      "string.empty": "El RUT es obligatorio.",
      "string.min": "El RUT debe tener al menos 8 caracteres.",
      "string.max": "El RUT debe tener menos de 12 caracteres.",
      "any.required": "El RUT es requerido."
    }),

  // Nombres y Apellidos
  nombres: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": "Los nombres son obligatorios.",
      "string.min": "Los nombres deben tener al menos 2 caracteres."
    }),

  apellidoPaterno: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": "El apellido paterno es obligatorio.",
      "string.min": "El apellido paterno debe tener al menos 2 caracteres."
    }),

  apellidoMaterno: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": "El apellido materno es obligatorio.",
      "string.min": "El apellido materno debe tener al menos 2 caracteres."
    }),

  // Datos personales
  fechaNacimiento: Joi.date()
    .iso()
    .allow(null)
    .messages({
      "date.base": "La fecha de nacimiento debe ser válida (ISO)."
    }),

  telefono: Joi.string()
    .min(8)
    .max(12)
    .required()
    .messages({
      "string.empty": "El teléfono es obligatorio."
    }),

  correo: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "El correo debe tener un formato válido.",
      "any.required": "El correo es obligatorio."
    }),

  numeroEmergencia: Joi.string()
    .min(8)
    .max(12)
    .allow(null, "")
    .messages({
      "string.min": "El número de emergencia debe tener al menos 8 caracteres.",
      "string.max": "El número de emergencia debe tener como máximo 12 caracteres."
    }),

  direccion: Joi.string()
    .min(5)
    .max(255)
    .required()
    .messages({
      "string.empty": "La dirección es obligatoria."
    }),

  // Información laboral
  cargo: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": "El cargo es obligatorio."
    }),

  area: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": "El área es obligatoria."
    }),

  // Contrato
  fechaInicioContrato: Joi.date()
    .iso()
    .required()
    .messages({
      "date.base": "La fecha de inicio de contrato debe ser válida (ISO).",
      "any.required": "La fecha de inicio de contrato es obligatoria."
    }),

  fechaFinContrato: Joi.date()
    .iso()
    .allow(null)
    .messages({
      "date.base": "La fecha de fin de contrato debe ser válida (ISO)."
    }),

  tipoContrato: Joi.string()
    .valid("Plazo fijo", "Indefinido", "Por obra")
    .required()
    .messages({
      "any.only": "El tipo de contrato debe ser 'Plazo fijo', 'Indefinido' o 'Por obra'."
    }),

  sueldoBase: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      "number.base": "El sueldo base debe ser un número.",
      "number.positive": "El sueldo debe ser mayor a 0.",
      "any.required": "El sueldo base es obligatorio."
    }),

  estado: Joi.string()
    .valid(...Object.values(EstadoTrabajador))
    .required()
    .messages({
      "any.only": "El estado debe ser 'Activo', 'Licencia' o 'Desvinculado'."
    })
});