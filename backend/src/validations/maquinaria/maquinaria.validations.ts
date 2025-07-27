import { body, param } from "express-validator"
import { GrupoMaquinaria, EstadoMaquinaria } from "../../entity/maquinaria/maquinaria.entity.js"

const validatePatenteChilena = (patente: string): boolean => {
  if (!patente) return false
  const cleanPatente = patente.replace(/-/g, "").toUpperCase()
  if (cleanPatente.length !== 6) return false
  const formatoEstandar = /^[A-Z]{2}[0-9]{4}$/.test(cleanPatente)
  const formatoEspecial = /^[A-Z]{4}[0-9]{2}$/.test(cleanPatente)
  return formatoEstandar || formatoEspecial
}

// Eliminadas validaciones de creación - solo se actualiza desde compra
export const updateMaquinariaValidation = [
  body("patente")
    .optional()
    .isString()
    .withMessage("La patente debe ser una cadena de texto")
    .custom((value) => {
      if (value && !validatePatenteChilena(value)) {
        throw new Error("Formato de patente inválido")
      }
      return true
    }),

  body("grupo")
    .optional()
    .isIn(Object.values(GrupoMaquinaria))
    .withMessage("El grupo debe ser uno de los valores válidos"),

  body("marca")
    .optional()
    .isString()
    .withMessage("La marca debe ser una cadena de texto")
    .isLength({ min: 2, max: 100 })
    .withMessage("La marca debe tener entre 2 y 100 caracteres"),

  body("modelo")
    .optional()
    .isString()
    .withMessage("El modelo debe ser una cadena de texto")
    .isLength({ min: 1, max: 100 })
    .withMessage("El modelo debe tener entre 1 y 100 caracteres"),

  body("año")
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(`El año debe estar entre 1900 y ${new Date().getFullYear() + 1}`)
    .toInt(),

  body("valorCompra")
    .optional()
    .isFloat({ min: 1000000, max: 5000000000 })
    .withMessage("El valor de compra debe estar entre $1.000.000 y $5.000.000.000")
    .toFloat(),

  body("avaluoFiscal")
    .optional()
    .isFloat({ min: 1000000, max: 5000000000 })
    .withMessage("El avalúo fiscal debe estar entre $1.000.000 y $5.000.000.000")
    .toFloat(),

  body("estado")
    .optional()
    .isIn(Object.values(EstadoMaquinaria))
    .withMessage("El estado debe ser uno de los valores válidos"),
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

export const actualizarKilometrajeValidation = [
  ...idValidation,
  body("kilometraje")
    .isInt({ min: 0, max: 999999 })
    .withMessage("El kilometraje debe estar entre 0 y 999,999 km")
    .toInt(),
]

export const cambiarEstadoValidation = [
  ...idValidation,
  body("estado").isIn(Object.values(EstadoMaquinaria)).withMessage("El estado debe ser uno de los valores válidos"),
]
