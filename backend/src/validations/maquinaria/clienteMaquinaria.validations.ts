import { body, param, query } from "express-validator"
import { validarRutChileno } from "../../utils/rutValidator.js"

export const createClienteMaquinariaValidation = [
  body("rut")
    .notEmpty()
    .withMessage("El RUT es requerido")
    .isString()
    .withMessage("El RUT debe ser una cadena de texto")
    .custom((value) => {
      if (!validarRutChileno(value)) {
        throw new Error("El RUT no es válido")
      }
      return true
    }),

  body("nombre")
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isString()
    .withMessage("El nombre debe ser una cadena de texto")
    .isLength({ min: 2, max: 255 })
    .withMessage("El nombre debe tener entre 2 y 255 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El nombre solo puede contener letras y espacios"),

  body("telefono")
    .optional()
    .isString()
    .withMessage("El teléfono debe ser una cadena de texto")
    .matches(/^(\+56)?[0-9]{8,9}$/)
    .withMessage("El teléfono debe ser un número válido chileno (8-9 dígitos)"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("El email debe ser válido")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("El email no puede exceder 255 caracteres"),

  body("direccion")
    .optional()
    .isString()
    .withMessage("La dirección debe ser una cadena de texto")
    .isLength({ max: 500 })
    .withMessage("La dirección no puede exceder 500 caracteres"),
]

export const updateClienteMaquinariaValidation = [
  body("rut")
    .optional()
    .isString()
    .withMessage("El RUT debe ser una cadena de texto")
    .custom((value) => {
      if (value && !validarRutChileno(value)) {
        throw new Error("El RUT no es válido")
      }
      return true
    }),

  body("nombre")
    .optional()
    .isString()
    .withMessage("El nombre debe ser una cadena de texto")
    .isLength({ min: 2, max: 255 })
    .withMessage("El nombre debe tener entre 2 y 255 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El nombre solo puede contener letras y espacios"),

  body("telefono")
    .optional()
    .isString()
    .withMessage("El teléfono debe ser una cadena de texto")
    .matches(/^(\+56)?[0-9]{8,9}$/)
    .withMessage("El teléfono debe ser un número válido chileno"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("El email debe ser válido")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("El email no puede exceder 255 caracteres"),

  body("direccion")
    .optional()
    .isString()
    .withMessage("La dirección debe ser una cadena de texto")
    .isLength({ max: 500 })
    .withMessage("La dirección no puede exceder 500 caracteres"),
]

export const idValidation = [
  param("id").isInt({ min: 1 }).withMessage("El ID debe ser un número entero positivo").toInt(),
]

export const rutValidation = [
  param("rut")
    .notEmpty()
    .withMessage("El RUT es requerido")
    .isString()
    .withMessage("El RUT debe ser una cadena de texto")
    .custom((value) => {
      if (!validarRutChileno(value)) {
        throw new Error("El RUT no es válido")
      }
      return true
    }),
]

export const searchValidation = [
  query("nombre")
    .optional()
    .isString()
    .withMessage("El nombre debe ser una cadena de texto")
    .isLength({ min: 2, max: 255 })
    .withMessage("El nombre debe tener entre 2 y 255 caracteres"),
]
