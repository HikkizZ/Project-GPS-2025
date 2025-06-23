import { body, param } from "express-validator"
import { GrupoMaquinaria, EstadoMaquinaria } from "../../entity/maquinaria/maquinaria.entity.js"

export const createMaquinariaValidation = [
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
    .optional()
    .isLength({ max: 100 })
    .withMessage("El número de chasis no puede exceder 100 caracteres"),

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

  body("estado")
    .optional()
    .isIn(Object.values(EstadoMaquinaria))
    .withMessage("El estado debe ser uno de los valores válidos"),

  body("cantidad").optional().isInt({ min: 1 }).withMessage("La cantidad debe ser un número entero positivo"),
]

export const updateMaquinariaValidation = [
  body("patente")
    .optional()
    .isLength({ min: 6, max: 20 })
    .withMessage("La patente debe tener entre 6 y 20 caracteres")
    .matches(/^[A-Z0-9]+$/)
    .withMessage("La patente solo puede contener letras mayúsculas y números"),

  body("grupo")
    .optional()
    .isIn(Object.values(GrupoMaquinaria))
    .withMessage("El grupo debe ser uno de los valores válidos"),

  body("marca").optional().isLength({ min: 2, max: 100 }).withMessage("La marca debe tener entre 2 y 100 caracteres"),

  body("modelo").optional().isLength({ min: 2, max: 100 }).withMessage("El modelo debe tener entre 2 y 100 caracteres"),

  body("año")
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(`El año debe estar entre 1900 y ${new Date().getFullYear() + 1}`),

  body("fechaCompra").optional().isISO8601().withMessage("La fecha de compra debe ser una fecha válida"),

  body("valorCompra").optional().isFloat({ min: 0 }).withMessage("El valor de compra debe ser un número positivo"),

  body("avaluoFiscal").optional().isFloat({ min: 0 }).withMessage("El avalúo fiscal debe ser un número positivo"),

  body("numeroChasis")
    .optional()
    .isLength({ max: 100 })
    .withMessage("El número de chasis no puede exceder 100 caracteres"),

  body("kilometrajeInicial")
    .optional()
    .isInt({ min: 0 })
    .withMessage("El kilometraje inicial debe ser un número entero positivo"),

  body("kilometrajeActual")
    .optional()
    .isInt({ min: 0 })
    .withMessage("El kilometraje actual debe ser un número entero positivo"),

  body("estado")
    .optional()
    .isIn(Object.values(EstadoMaquinaria))
    .withMessage("El estado debe ser uno de los valores válidos"),

  body("cantidad").optional().isInt({ min: 0 }).withMessage("La cantidad debe ser un número entero no negativo"),
]

export const comprarMaquinariaValidation = [
  body("maquinariaId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID de maquinaria debe ser un número entero positivo"),

  body("maquinariaData").optional().isObject().withMessage("Los datos de maquinaria deben ser un objeto"),

  body("precioCompra").isFloat({ min: 0 }).withMessage("El precio de compra debe ser un número positivo"),

  body("fechaCompra").isISO8601().withMessage("La fecha de compra debe ser una fecha válida"),

  body("proveedor").optional().isLength({ max: 255 }).withMessage("El proveedor no puede exceder 255 caracteres"),

  body("observaciones")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Las observaciones no pueden exceder 1000 caracteres"),
]

export const venderMaquinariaValidation = [
  body("maquinariaId").isInt({ min: 1 }).withMessage("El ID de maquinaria debe ser un número entero positivo"),

  body("precioVenta").isFloat({ min: 0 }).withMessage("El precio de venta debe ser un número positivo"),

  body("fechaVenta").isISO8601().withMessage("La fecha de venta debe ser una fecha válida"),

  body("comprador").optional().isLength({ max: 255 }).withMessage("El comprador no puede exceder 255 caracteres"),

  body("observaciones")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Las observaciones no pueden exceder 1000 caracteres"),
]

export const idValidation = [param("id").isInt({ min: 1 }).withMessage("El ID debe ser un número entero positivo")]

export const patenteValidation = [
  param("patente")
    .notEmpty()
    .withMessage("La patente es requerida")
    .isLength({ min: 6, max: 20 })
    .withMessage("La patente debe tener entre 6 y 20 caracteres"),
]

export const grupoValidation = [
  param("grupo").isIn(Object.values(GrupoMaquinaria)).withMessage("El grupo debe ser uno de los valores válidos"),
]

export const actualizarKilometrajeValidation = [
  ...idValidation,
  body("kilometraje").isInt({ min: 0 }).withMessage("El kilometraje debe ser un número entero positivo"),
]

export const cambiarEstadoValidation = [
  ...idValidation,
  body("estado").isIn(Object.values(EstadoMaquinaria)).withMessage("El estado debe ser uno de los valores válidos"),
]
