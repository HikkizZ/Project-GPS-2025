import { body } from "express-validator"
import { TipoLicencia } from "../../entity/maquinaria/conductor.entity.js"

export const validarCrearConductor = [
  body("rut")
    .isString()
    .isLength({ min: 8, max: 12 })
    .withMessage("El RUT debe tener entre 8 y 12 caracteres")
    .customSanitizer((value) => value.replace(/[^0-9kK]/g, "")),

  body("nombre").isString().isLength({ min: 2, max: 100 }).withMessage("El nombre debe tener entre 2 y 100 caracteres"),

  body("tipoLicencia").isIn(Object.values(TipoLicencia)).withMessage("Tipo de licencia inválido"),

  body("fechaNacimiento")
    .isISO8601()
    .withMessage("La fecha de nacimiento debe ser válida")
    .custom((value) => {
      const fechaNacimiento = new Date(value)
      const hoy = new Date()
      const edad = hoy.getFullYear() - fechaNacimiento.getFullYear()

      if (edad < 18 || edad > 100) {
        throw new Error("La edad debe estar entre 18 y 100 años")
      }

      return true
    }),
]

export const validarActualizarConductor = [
  body("rut")
    .optional()
    .isString()
    .isLength({ min: 8, max: 12 })
    .withMessage("El RUT debe tener entre 8 y 12 caracteres")
    .customSanitizer((value) => value.replace(/[^0-9kK]/g, "")),

  body("nombre")
    .optional()
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres"),

  body("tipoLicencia").optional().isIn(Object.values(TipoLicencia)).withMessage("Tipo de licencia inválido"),

  body("fechaNacimiento")
    .optional()
    .isISO8601()
    .withMessage("La fecha de nacimiento debe ser válida")
    .custom((value) => {
      if (value) {
        const fechaNacimiento = new Date(value)
        const hoy = new Date()
        const edad = hoy.getFullYear() - fechaNacimiento.getFullYear()

        if (edad < 18 || edad > 100) {
          throw new Error("La edad debe estar entre 18 y 100 años")
        }
      }

      return true
    }),
]
