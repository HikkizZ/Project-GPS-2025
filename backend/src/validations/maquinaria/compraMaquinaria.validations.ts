import { body, param, query } from "express-validator"

const validatePatenteChilena = (patente: string): boolean => {
  if (!patente) return false
  const cleanPatente = patente.replace(/-/g, "").toUpperCase()
  if (cleanPatente.length !== 6) return false
  const formatoEstandar = /^[A-Z]{2}[0-9]{4}$/.test(cleanPatente)
  const formatoEspecial = /^[A-Z]{4}[0-9]{2}$/.test(cleanPatente)
  return formatoEstandar || formatoEspecial
}

const gruposValidos = [
  "camion_tolva",
  "batea",
  "cama_baja",
  "pluma",
  "escavadora",
  "retroexcavadora",
  "cargador_frontal",
]

export const registrarCompraValidation = [
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
    .withMessage("El grupo de maquinaria es requerido")
    .isIn(gruposValidos)
    .withMessage("Grupo de maquinaria inválido"),

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

  body("anio")
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
    .withMessage("El número de chasis debe tener entre 5 y 100 caracteres")
    .matches(/^[A-Z0-9]+$/)
    .withMessage("El número de chasis solo puede contener letras mayúsculas y números"),

  body("kilometrajeInicial")
    .optional()
    .isInt({ min: 0, max: 999999 })
    .withMessage("El kilometraje inicial debe estar entre 0 y 999,999 km")
    .toInt(),

  body("proveedor")
    .optional()
    .isString()
    .withMessage("El proveedor debe ser una cadena de texto")
    .isLength({ max: 255 })
    .withMessage("El proveedor no puede exceder 255 caracteres"),

  body("observaciones")
    .optional()
    .isString()
    .withMessage("Las observaciones deben ser una cadena de texto")
    .isLength({ max: 1000 })
    .withMessage("Las observaciones no pueden exceder 1000 caracteres"),
]

export const actualizarCompraValidation = [
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

  body("grupo").optional().isIn(gruposValidos).withMessage("Grupo de maquinaria inválido"),

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

  body("anio")
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

  body("proveedor")
    .optional()
    .isString()
    .withMessage("El proveedor debe ser una cadena de texto")
    .isLength({ max: 255 })
    .withMessage("El proveedor no puede exceder 255 caracteres"),

  body("observaciones")
    .optional()
    .isString()
    .withMessage("Las observaciones deben ser una cadena de texto")
    .isLength({ max: 1000 })
    .withMessage("Las observaciones no pueden exceder 1000 caracteres"),
]

export const compraIdValidation = [
  param("id").isInt({ min: 1 }).withMessage("El ID de compra debe ser un número entero positivo").toInt(),
]

export const maquinariaIdValidation = [
  param("maquinariaId").isInt({ min: 1 }).withMessage("El ID de maquinaria debe ser un número entero positivo").toInt(),
]

export const fechaRangoValidation = [
  query("fechaInicio").isISO8601().withMessage("La fecha de inicio debe ser una fecha válida"),

  query("fechaFin")
    .isISO8601()
    .withMessage("La fecha de fin debe ser una fecha válida")
    .custom((value, { req }) => {
      if (!req.query || !req.query.fechaInicio) {
        throw new Error("La fecha de inicio es requerida para validar el rango")
      }

      const fechaFin = new Date(value)
      const fechaInicio = new Date(req.query.fechaInicio as string)

      if (fechaFin < fechaInicio) {
        throw new Error("La fecha de fin debe ser posterior o igual a la fecha de inicio")
      }

      const unAno = 365 * 24 * 60 * 60 * 1000
      if (fechaFin.getTime() - fechaInicio.getTime() > unAno) {
        throw new Error("El rango de fechas no puede ser mayor a 1 año")
      }

      return true
    }),
]