import { body, param, query } from "express-validator"

// Función para validar patente chilena
const validatePatenteChilena = (patente: string): boolean => {
  if (!patente) return false

  // Remover guiones para validación
  const cleanPatente = patente.replace(/-/g, "").toUpperCase()

  // Validar longitud (debe ser 6 caracteres)
  if (cleanPatente.length !== 6) return false

  // Validar formatos válidos:
  // 1. LL-NN-NN (2 letras, 4 números)
  // 2. LL-LL-NN (4 letras, 2 números) - para vehículos especiales
  const formatoEstandar = /^[A-Z]{2}[0-9]{4}$/.test(cleanPatente)
  const formatoEspecial = /^[A-Z]{4}[0-9]{2}$/.test(cleanPatente)

  return formatoEstandar || formatoEspecial
}

// ✅ Corregido: Usar la función de validación personalizada
export const registrarCompraValidation = [
  body("patente")
    .notEmpty()
    .withMessage("La patente es requerida")
    .custom((value) => {
      if (!validatePatenteChilena(value)) {
        throw new Error("Formato de patente inválido. Use formato chileno: AB-12-34 o AB-CD-12")
      }
      return true
    }),

  body("grupo")
    .notEmpty()
    .withMessage("El grupo de maquinaria es requerido")
    .isIn(["camion_tolva", "batea", "cama_baja", "pluma", "escavadora", "retroexcavadora", "cargador_frontal"])
    .withMessage("Grupo de maquinaria inválido"),

  body("marca")
    .notEmpty()
    .withMessage("La marca es requerida")
    .isLength({ min: 2, max: 100 })
    .withMessage("La marca debe tener entre 2 y 100 caracteres"),

  body("modelo")
    .notEmpty()
    .withMessage("El modelo es requerido")
    .isLength({ min: 1, max: 100 })
    .withMessage("El modelo debe tener entre 1 y 100 caracteres"),

  body("año")
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(`El año debe estar entre 1900 y ${new Date().getFullYear() + 1}`),

  body("fechaCompra").isISO8601().withMessage("La fecha de compra debe ser una fecha válida"),

  body("valorCompra")
    .isFloat({ min: 1000000, max: 2000000000 })
    .withMessage("El valor de compra debe estar entre $1.000.000 y $2.000.000.000"),

  body("avaluoFiscal")
    .isFloat({ min: 1000000, max: 2000000000 })
    .withMessage("El avalúo fiscal debe estar entre $1.000.000 y $2.000.000.000"),

  body("numeroChasis")
    .notEmpty()
    .withMessage("El número de chasis es requerido")
    .isLength({ min: 5, max: 100 })
    .withMessage("El número de chasis debe tener entre 5 y 100 caracteres"),

  body("kilometrajeInicial")
    .optional()
    .isInt({ min: 0, max: 999999 })
    .withMessage("El kilometraje inicial debe estar entre 0 y 999,999 km"),

  body("kilometrajeActual")
    .optional()
    .isInt({ min: 0, max: 999999 })
    .withMessage("El kilometraje actual debe estar entre 0 y 999,999 km"),

  body("proveedor").optional().isLength({ max: 255 }).withMessage("El proveedor no puede exceder 255 caracteres"),

  body("observaciones")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Las observaciones no pueden exceder 1000 caracteres"),
]

export const actualizarCompraValidation = [
  body("patente")
    .optional()
    .custom((value) => {
      if (value && !validatePatenteChilena(value)) {
        throw new Error("Formato de patente inválido. Use formato chileno: AB-12-34 o AB-CD-12")
      }
      return true
    }),

  body("grupo")
    .optional()
    .isIn(["camion_tolva", "batea", "cama_baja", "pluma", "escavadora", "retroexcavadora", "cargador_frontal"])
    .withMessage("Grupo de maquinaria inválido"),

  body("marca").optional().isLength({ min: 2, max: 100 }).withMessage("La marca debe tener entre 2 y 100 caracteres"),

  body("modelo").optional().isLength({ min: 1, max: 100 }).withMessage("El modelo debe tener entre 1 y 100 caracteres"),

  body("año")
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(`El año debe estar entre 1900 y ${new Date().getFullYear() + 1}`),

  body("fechaCompra").optional().isISO8601().withMessage("La fecha de compra debe ser una fecha válida"),

  body("valorCompra")
    .optional()
    .isFloat({ min: 1000000, max: 2000000000 })
    .withMessage("El valor de compra debe estar entre $1.000.000 y $2.000.000.000"),

  body("avaluoFiscal")
    .optional()
    .isFloat({ min: 1000000, max: 2000000000 })
    .withMessage("El avalúo fiscal debe estar entre $1.000.000 y $2.000.000.000"),

  body("numeroChasis")
    .optional()
    .isLength({ min: 5, max: 100 })
    .withMessage("El número de chasis debe tener entre 5 y 100 caracteres"),

  body("kilometrajeInicial")
    .optional()
    .isInt({ min: 0, max: 999999 })
    .withMessage("El kilometraje inicial debe estar entre 0 y 999,999 km"),

  body("kilometrajeActual")
    .optional()
    .isInt({ min: 0, max: 999999 })
    .withMessage("El kilometraje actual debe estar entre 0 y 999,999 km"),

  body("proveedor").optional().isLength({ max: 255 }).withMessage("El proveedor no puede exceder 255 caracteres"),

  body("observaciones")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Las observaciones no pueden exceder 1000 caracteres"),
]

export const compraIdValidation = [
  param("id").isInt({ min: 1 }).withMessage("El ID de compra debe ser un número entero positivo"),
]

export const maquinariaIdValidation = [
  param("maquinariaId").isInt({ min: 1 }).withMessage("El ID de maquinaria debe ser un número entero positivo"),
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
      return true
    }),
]
