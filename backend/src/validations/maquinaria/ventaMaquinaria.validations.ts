import { body, param, query } from "express-validator"

export const registrarVentaValidation = [
  body("patente")
    .notEmpty()
    .withMessage("La patente es requerida")
    .isLength({ min: 6, max: 20 })
    .withMessage("La patente debe tener entre 6 y 20 caracteres")
    .matches(/^[A-Z0-9]+$/)
    .withMessage("La patente solo puede contener letras mayúsculas y números"),

  body("fechaVenta").isISO8601().withMessage("La fecha de venta debe ser una fecha válida"),

  body("valorCompra").isFloat({ min: 0 }).withMessage("El valor de compra debe ser un número positivo"),

  body("valorVenta").isFloat({ min: 0 }).withMessage("El valor de venta debe ser un número positivo"),

  body("comprador").optional().isLength({ max: 255 }).withMessage("El comprador no puede exceder 255 caracteres"),

  body("observaciones")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Las observaciones no pueden exceder 1000 caracteres"),
]

export const actualizarVentaValidation = [
  body("valorCompra").optional().isFloat({ min: 0 }).withMessage("El valor de compra debe ser un número positivo"),

  body("valorVenta").optional().isFloat({ min: 0 }).withMessage("El valor de venta debe ser un número positivo"),

  body("comprador").optional().isLength({ max: 255 }).withMessage("El comprador no puede exceder 255 caracteres"),

  body("observaciones")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Las observaciones no pueden exceder 1000 caracteres"),
]

export const ventaIdValidation = [param("id").isInt({ min: 1 }).withMessage("El ID debe ser un número entero positivo")]

export const patenteValidation = [
  param("patente")
    .notEmpty()
    .withMessage("La patente es requerida")
    .isLength({ min: 6, max: 20 })
    .withMessage("La patente debe tener entre 6 y 20 caracteres"),
]

export const fechaRangoValidation = [
  query("fechaInicio").isISO8601().withMessage("La fecha de inicio debe ser válida"),
  query("fechaFin").isISO8601().withMessage("La fecha de fin debe ser válida"),
]

export const maquinariaIdValidation = [
  param("maquinariaId").isInt({ min: 1 }).withMessage("El ID de maquinaria debe ser un número entero positivo"),
]
