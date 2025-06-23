import { body, param, query } from "express-validator"
import { GrupoMaquinaria } from "../../entity/maquinaria/maquinaria.entity.js"

export const registrarCompraValidation = [
  body("patente")
    .notEmpty()
    .withMessage("La patente es requerida")
    .isLength({ min: 6, max: 20 })
    .withMessage("La patente debe tener entre 6 y 20 caracteres")
    .matches(/^[A-Z0-9]+$/)
    .withMessage("La patente solo puede contener letras mayúsculas y números"),

  body("grupo")
    .notEmpty()
    .withMessage("El grupo es requerido")
    .isIn(Object.values(GrupoMaquinaria))
    .withMessage("El grupo debe ser uno de los valores válidos"),

  body("marca")
    .notEmpty()
    .withMessage("La marca es requerida")
    .isLength({ min: 2, max: 100 })
    .withMessage("La marca debe tener entre 2 y 100 caracteres"),

  body("modelo")
    .notEmpty()
    .withMessage("El modelo es requerido")
    .isLength({ min: 2, max: 100 })
    .withMessage("El modelo debe tener entre 2 y 100 caracteres"),

  body("año")
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(`El año debe estar entre 1900 y ${new Date().getFullYear() + 1}`),

  body("fechaCompra").isISO8601().withMessage("La fecha de compra debe ser una fecha válida"),

  body("valorCompra").isFloat({ min: 0 }).withMessage("El valor de compra debe ser un número positivo"),

  body("avaluoFiscal").isFloat({ min: 0 }).withMessage("El avalúo fiscal debe ser un número positivo"),

  body("numeroChasis")
    .notEmpty()
    .withMessage("El número de chasis es requerido")
    .isLength({ min: 5, max: 100 })
    .withMessage("El número de chasis debe tener entre 5 y 100 caracteres"),

  body("kilometrajeInicial").isInt({ min: 0 }).withMessage("El kilometraje inicial debe ser un número entero positivo"),

  body("kilometrajeActual")
    .isInt({ min: 0 })
    .withMessage("El kilometraje actual debe ser un número entero positivo")
    .custom((value, { req }) => {
      if (value < req.body.kilometrajeInicial) {
        throw new Error("El kilometraje actual no puede ser menor al inicial")
      }
      return true
    }),

  body("proveedor").optional().isLength({ max: 255 }).withMessage("El proveedor no puede exceder 255 caracteres"),

  body("observaciones")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Las observaciones no pueden exceder 1000 caracteres"),
]

export const actualizarCompraValidation = [
  body("proveedor").optional().isLength({ max: 255 }).withMessage("El proveedor no puede exceder 255 caracteres"),

  body("observaciones")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Las observaciones no pueden exceder 1000 caracteres"),
]

export const compraIdValidation = [
  param("id").isInt({ min: 1 }).withMessage("El ID debe ser un número entero positivo"),
]

export const maquinariaIdValidation = [
  param("maquinariaId").isInt({ min: 1 }).withMessage("El ID de maquinaria debe ser un número entero positivo"),
]

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
