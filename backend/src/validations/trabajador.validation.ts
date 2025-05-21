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
  nombre: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      "string.base": "El nombre debe ser texto.",
      "string.empty": "El nombre es obligatorio.",
      "string.min": "El nombre debe tener al menos 3 caracteres.",
      "string.max": "El nombre debe tener como máximo 255 caracteres.",
      "any.required": "El nombre es requerido."
    }),

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

  direccion: Joi.string()
    .min(5)
    .max(255)
    .required()
    .messages({
      "string.empty": "La dirección es obligatoria."
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

  fechaIngreso: Joi.date()
    .iso()
    .required()
    .messages({
      "date.base": "La fecha de ingreso debe ser válida (ISO)."
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