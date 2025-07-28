import { body, param, query } from "express-validator"
import { validarRutChileno } from "../../utils/rutValidator.js"

const validatePatenteChilena = (patente: string): boolean => {
  if (!patente) return false
  const cleanPatente = patente.replace(/-/g, "").toUpperCase()
  if (cleanPatente.length !== 6) return false
  const formatoEstandar = /^[A-Z]{2}[0-9]{4}$/.test(cleanPatente)
  const formatoEspecial = /^[A-Z]{4}[0-9]{2}$/.test(cleanPatente)
  return formatoEstandar || formatoEspecial
}

export const crearArriendoValidation = [
  body("numeroReporte")
    .notEmpty()
    .withMessage("El número de reporte es requerido")
    .isString()
    .withMessage("El número de reporte debe ser una cadena de texto")
    .isLength({ min: 4, max: 10 })
    .withMessage("El número de reporte debe tener entre 4 y 10 caracteres")
    .matches(/^[A-Z0-9-]+$/)
    .withMessage("El número de reporte solo puede contener letras mayúsculas, números y guiones"),

  body("patente")
    .notEmpty()
    .withMessage("La patente es requerida")
    .isString()
    .withMessage("La patente debe ser una cadena de texto")
    .custom((value) => {
      if (!validatePatenteChilena(value)) {
        throw new Error("Formato de patente inválido. Use formato chileno: AB-12-34 o AB-CD-12")
      }
      return true
    }),

  body("rutCliente")
    .notEmpty()
    .withMessage("El RUT del cliente es requerido")
    .isString()
    .withMessage("El RUT debe ser una cadena de texto")
    .custom((value) => {
      if (!validarRutChileno(value)) {
        throw new Error("El RUT del cliente no es válido")
      }
      return true
    }),

  body("nombreCliente")
    .notEmpty()
    .withMessage("El nombre del cliente es requerido")
    .isString()
    .withMessage("El nombre debe ser una cadena de texto")
    .isLength({ min: 2, max: 255 })
    .withMessage("El nombre del cliente debe tener entre 2 y 255 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-.]+$/)
    .withMessage("El nombre solo puede contener letras, espacios, guiones y puntos"),

  body("obra")
    .notEmpty()
    .withMessage("La obra es requerida")
    .isString()
    .withMessage("La obra debe ser una cadena de texto")
    .isLength({ min: 2, max: 500 })
    .withMessage("La obra debe tener entre 2 y 500 caracteres"),

  body("detalle")
    .optional()
    .isString()
    .withMessage("El detalle debe ser una cadena de texto")
    .isLength({ max: 1000 })
    .withMessage("El detalle no puede exceder 1000 caracteres"),

  body("kmFinal")
    .isInt({ min: 1, max: 999999 })
    .withMessage("El kilometraje final debe estar entre 1 y 999,999 km")
    .toInt(),

  body("valorServicio")
    .isFloat({ min: 10000, max: 10000000 })
    .withMessage("El valor del servicio debe estar entre $10.000 y $10.000.000")
    .toFloat(),

  body("fechaTrabajo")
    .isISO8601()
    .withMessage("La fecha de trabajo debe ser una fecha válida")
    .custom((value) => {
      const fechaTrabajo = new Date(value)
      const hoy = new Date()
      hoy.setHours(23, 59, 59, 999)

      if (fechaTrabajo > hoy) {
        throw new Error("La fecha de trabajo no puede ser futura")
      }

      // Validar que no sea muy antigua (más de 1 año)
      const unAnoAtras = new Date()
      unAnoAtras.setFullYear(unAnoAtras.getFullYear() - 1)
      if (fechaTrabajo < unAnoAtras) {
        throw new Error("La fecha de trabajo no puede ser anterior a 1 año")
      }

      return true
    }),
]

export const actualizarArriendoValidation = [
  body("rutCliente")
    .optional()
    .isString()
    .withMessage("El RUT debe ser una cadena de texto")
    .custom((value) => {
      if (value && !validarRutChileno(value)) {
        throw new Error("El RUT del cliente no es válido")
      }
      return true
    }),

  body("nombreCliente")
    .optional()
    .isString()
    .withMessage("El nombre debe ser una cadena de texto")
    .isLength({ min: 2, max: 255 })
    .withMessage("El nombre del cliente debe tener entre 2 y 255 caracteres"),

  body("obra")
    .optional()
    .isString()
    .withMessage("La obra debe ser una cadena de texto")
    .isLength({ min: 2, max: 500 })
    .withMessage("La obra debe tener entre 2 y 500 caracteres"),

  body("detalle")
    .optional()
    .isString()
    .withMessage("El detalle debe ser una cadena de texto")
    .isLength({ max: 1000 })
    .withMessage("El detalle no puede exceder 1000 caracteres"),

  body("valorServicio")
    .optional()
    .isFloat({ min: 10000, max: 10000000 })
    .withMessage("El valor del servicio debe estar entre $10.000 y $10.000.000")
    .toFloat(),
]

export const idValidation = [
  param("id").isInt({ min: 1 }).withMessage("El ID debe ser un número entero positivo").toInt(),
]

export const patenteValidation = [
  param("patente")
    .notEmpty()
    .withMessage("La patente es requerida")
    .isString()
    .withMessage("La patente debe ser una cadena de texto")
    .custom((value) => {
      if (!validatePatenteChilena(value)) {
        throw new Error("Formato de patente inválido")
      }
      return true
    }),
]

export const rutClienteValidation = [
  param("rutCliente")
    .notEmpty()
    .withMessage("El RUT del cliente es requerido")
    .isString()
    .withMessage("El RUT debe ser una cadena de texto")
    .custom((value) => {
      if (!validarRutChileno(value)) {
        throw new Error("El RUT del cliente no es válido")
      }
      return true
    }),
]

export const fechaRangoValidation = [
  query("fechaInicio").isISO8601().withMessage("La fecha de inicio debe ser válida"),

  query("fechaFin")
    .isISO8601()
    .withMessage("La fecha de fin debe ser válida")
    .custom((value, { req }) => {
      if (!req.query || !req.query.fechaInicio) {
        throw new Error("La fecha de inicio es requerida")
      }

      const fechaFin = new Date(value)
      const fechaInicio = new Date(req.query.fechaInicio as string)

      if (fechaFin < fechaInicio) {
        throw new Error("La fecha de fin debe ser posterior a la fecha de inicio")
      }

      return true
    }),
]