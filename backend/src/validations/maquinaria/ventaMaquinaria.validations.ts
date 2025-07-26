import { body, param, query } from "express-validator"

const validatePatenteChilena = (patente: string): boolean => {
  if (!patente) return false
  const cleanPatente = patente.replace(/-/g, "").toUpperCase()
  if (cleanPatente.length !== 6) return false
  const formatoEstandar = /^[A-Z]{2}[0-9]{4}$/.test(cleanPatente)
  const formatoEspecial = /^[A-Z]{4}[0-9]{2}$/.test(cleanPatente)
  return formatoEstandar || formatoEspecial
}

export const registrarVentaValidation = [
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

  body("fechaVenta")
    .isISO8601()
    .withMessage("La fecha de venta debe ser una fecha válida")
    .custom((value) => {
      const fecha = new Date(value)
      const hoy = new Date()
      if (fecha > hoy) {
        throw new Error("La fecha de venta no puede ser futura")
      }
      return true
    }),

  body("valorCompra")
    .isFloat({ min: 1000000, max: 5000000000 })
    .withMessage("El valor de compra debe estar entre $1.000.000 y $5.000.000.000")
    .toFloat(),

  body("valorVenta")
    .isFloat({ min: 1000000, max: 5000000000 })
    .withMessage("El valor de venta debe estar entre $1.000.000 y $5.000.000.000")
    .toFloat()
    .custom((value, { req }) => {
      // Validar que el valor de venta no sea menor al 50% del valor de compra
      const valorCompra = req.body.valorCompra
      if (valorCompra && value < valorCompra * 0.1) {
        throw new Error("El valor de venta no puede ser menor al 50% del valor de compra")
      }
      return true
    }),

  body("comprador")
    .optional()
    .isString()
    .withMessage("El comprador debe ser una cadena de texto")
    .isLength({ min: 2, max: 255 })
    .withMessage("El comprador debe tener entre 2 y 255 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-.]+$/)
    .withMessage("El comprador solo puede contener letras, espacios, guiones y puntos"),

  body("observaciones")
    .optional()
    .isString()
    .withMessage("Las observaciones deben ser una cadena de texto")
    .isLength({ max: 1000 })
    .withMessage("Las observaciones no pueden exceder 1000 caracteres"),
]

export const ventaIdValidation = [
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

export const compradorValidation = [
  param("comprador")
    .notEmpty()
    .withMessage("El comprador es requerido")
    .isString()
    .withMessage("El comprador debe ser una cadena de texto")
    .isLength({ min: 2, max: 255 })
    .withMessage("El comprador debe tener entre 2 y 255 caracteres"),
]
