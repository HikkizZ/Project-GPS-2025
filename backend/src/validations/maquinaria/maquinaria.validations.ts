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

export const createMaquinariaValidation = [
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

  body("grupo")
    .notEmpty()
    .withMessage("El grupo es requerido")
    .isIn(Object.values(GrupoMaquinaria))
    .withMessage("El grupo debe ser uno de los valores válidos"),

  body("marca")
    .notEmpty()
    .withMessage("La marca es requerida")
    .isString()
    .withMessage("La marca debe ser una cadena de texto")
    .isLength({ min: 2, max: 100 })
    .withMessage("La marca debe tener entre 2 y 100 caracteres")
    .matches(/^[a-zA-Z0-9\s\-.]+$/)
    .withMessage("La marca solo puede contener letras, números, espacios, guiones y puntos"),

  body("modelo")
    .notEmpty()
    .withMessage("El modelo es requerido")
    .isString()
    .withMessage("El modelo debe ser una cadena de texto")
    .isLength({ min: 1, max: 100 })
    .withMessage("El modelo debe tener entre 1 y 100 caracteres"),

  body("año")
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(`El año debe estar entre 1900 y ${new Date().getFullYear() + 1}`)
    .toInt(),

  body("fechaCompra")
    .isISO8601()
    .withMessage("La fecha de compra debe ser una fecha válida")
    .custom((value) => {
      const fecha = new Date(value)
      const hoy = new Date()
      if (fecha > hoy) {
        throw new Error("La fecha de compra no puede ser futura")
      }
      return true
    }),

  body("valorCompra")
    .isFloat({ min: 1000000, max: 5000000000 })
    .withMessage("El valor de compra debe estar entre $1.000.000 y $5.000.000.000")
    .toFloat(),

  body("avaluoFiscal")
    .isFloat({ min: 1000000, max: 5000000000 })
    .withMessage("El avalúo fiscal debe estar entre $1.000.000 y $5.000.000.000")
    .toFloat(),

  body("numeroChasis")
    .notEmpty()
    .withMessage("El número de chasis es requerido")
    .isString()
    .withMessage("El número de chasis debe ser una cadena de texto")
    .isLength({ min: 5, max: 100 })
    .withMessage("El número de chasis debe tener entre 5 y 100 caracteres"),

  body("kilometrajeInicial")
    .optional()
    .isInt({ min: 0, max: 999999 })
    .withMessage("El kilometraje inicial debe estar entre 0 y 999,999 km")
    .toInt(),

  body("kilometrajeActual")
    .optional()
    .isInt({ min: 0, max: 999999 })
    .withMessage("El kilometraje actual debe estar entre 0 y 999,999 km")
    .toInt()
    .custom((value, { req }) => {
      const inicial = req.body.kilometrajeInicial || 0
      if (value < inicial) {
        throw new Error("El kilometraje actual no puede ser menor al inicial")
      }
      return true
    }),

  body("estado")
    .optional()
    .isIn(Object.values(EstadoMaquinaria))
    .withMessage("El estado debe ser uno de los valores válidos"),
]

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
