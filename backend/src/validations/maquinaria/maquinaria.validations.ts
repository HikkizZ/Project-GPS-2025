import { body } from "express-validator"
import { GrupoMaquinaria } from "../../entity/maquinaria/maquinaria.entity.js"

export const createMaquinariaValidation = [
  body("patente")
    .notEmpty()
    .withMessage("La patente es obligatoria")
    .isString()
    .withMessage("La patente debe ser un texto")
    .isLength({ max: 20 })
    .withMessage("La patente no debe exceder los 20 caracteres"),

  body("grupo")
    .notEmpty()
    .withMessage("El grupo es obligatorio")
    .isIn(Object.values(GrupoMaquinaria))
    .withMessage("El grupo debe ser uno de los valores permitidos"),

  body("marca")
    .notEmpty()
    .withMessage("La marca es obligatoria")
    .isString()
    .withMessage("La marca debe ser un texto")
    .isLength({ max: 100 })
    .withMessage("La marca no debe exceder los 100 caracteres"),

  body("modelo")
    .notEmpty()
    .withMessage("El modelo es obligatorio")
    .isString()
    .withMessage("El modelo debe ser un texto")
    .isLength({ max: 100 })
    .withMessage("El modelo no debe exceder los 100 caracteres"),

  body("año")
    .notEmpty()
    .withMessage("El año es obligatorio")
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage("El año debe ser un número válido"),

  body("fechaCompra")
    .notEmpty()
    .withMessage("La fecha de compra es obligatoria")
    .isISO8601()
    .withMessage("La fecha de compra debe tener un formato válido"),

  body("valorCompra")
    .notEmpty()
    .withMessage("El valor de compra es obligatorio")
    .isFloat({ min: 0 })
    .withMessage("El valor de compra debe ser un número positivo"),

  body("avaluoFiscal")
    .notEmpty()
    .withMessage("El avalúo fiscal es obligatorio")
    .isFloat({ min: 0 })
    .withMessage("El avalúo fiscal debe ser un número positivo"),

  body("numeroChasis")
    .optional()
    .isString()
    .withMessage("El número de chasis debe ser un texto")
    .isLength({ max: 100 })
    .withMessage("El número de chasis no debe exceder los 100 caracteres"),

  body("kilometrajeInicial")
    .notEmpty()
    .withMessage("El kilometraje inicial es obligatorio")
    .isInt({ min: 0 })
    .withMessage("El kilometraje inicial debe ser un número entero positivo"),

  body("kilometrajeActual")
    .notEmpty()
    .withMessage("El kilometraje actual es obligatorio")
    .isInt({ min: 0 })
    .withMessage("El kilometraje actual debe ser un número entero positivo")
    .custom((value, { req }) => {
      if (value < req.body.kilometrajeInicial) {
        throw new Error("El kilometraje actual no puede ser menor que el kilometraje inicial")
      }
      return true
    }),
]

export const updateMaquinariaValidation = [
  body("patente")
    .optional()
    .isString()
    .withMessage("La patente debe ser un texto")
    .isLength({ max: 20 })
    .withMessage("La patente no debe exceder los 20 caracteres"),

  body("grupo")
    .optional()
    .isIn(Object.values(GrupoMaquinaria))
    .withMessage("El grupo debe ser uno de los valores permitidos"),

  body("marca")
    .optional()
    .isString()
    .withMessage("La marca debe ser un texto")
    .isLength({ max: 100 })
    .withMessage("La marca no debe exceder los 100 caracteres"),

  body("modelo")
    .optional()
    .isString()
    .withMessage("El modelo debe ser un texto")
    .isLength({ max: 100 })
    .withMessage("El modelo no debe exceder los 100 caracteres"),

  body("año")
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage("El año debe ser un número válido"),

  body("fechaCompra").optional().isISO8601().withMessage("La fecha de compra debe tener un formato válido"),

  body("valorCompra").optional().isFloat({ min: 0 }).withMessage("El valor de compra debe ser un número positivo"),

  body("avaluoFiscal").optional().isFloat({ min: 0 }).withMessage("El avalúo fiscal debe ser un número positivo"),

  body("numeroChasis")
    .optional()
    .isString()
    .withMessage("El número de chasis debe ser un texto")
    .isLength({ max: 100 })
    .withMessage("El número de chasis no debe exceder los 100 caracteres"),

  body("kilometrajeInicial")
    .optional()
    .isInt({ min: 0 })
    .withMessage("El kilometraje inicial debe ser un número entero positivo"),

  body("kilometrajeActual")
    .optional()
    .isInt({ min: 0 })
    .withMessage("El kilometraje actual debe ser un número entero positivo"),
]
