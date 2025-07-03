import { body, param, query } from "express-validator"

export const crearArriendoValidation = [
  body("maquinariaId").isInt({ min: 1 }).withMessage("El ID de maquinaria debe ser un número entero positivo"),

  body("clienteId").isInt({ min: 1 }).withMessage("El ID de cliente debe ser un número entero positivo"),

  body("conductorId").isInt({ min: 1 }).withMessage("El ID de conductor debe ser un número entero positivo"),

  body("fecha")
    .isISO8601()
    .withMessage("La fecha debe ser una fecha válida")
    .custom((value) => {
      const fecha = new Date(value)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      if (fecha < hoy) {
        throw new Error("La fecha no puede ser anterior a hoy")
      }
      return true
    }),

  body("montoTotal").isFloat({ min: 0 }).withMessage("El monto total debe ser un número positivo"),

  body("obra")
    .notEmpty()
    .withMessage("La obra es requerida")
    .isLength({ min: 2, max: 500 })
    .withMessage("La obra debe tener entre 2 y 500 caracteres"),

  body("kilometrajeInicial")
    .optional()
    .isInt({ min: 0 })
    .withMessage("El kilometraje inicial debe ser un número entero positivo"),

  body("observaciones")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Las observaciones no pueden exceder 1000 caracteres"),

  body("telefonoEmergencia")
    .optional()
    .isMobilePhone("es-CL")
    .withMessage("El teléfono de emergencia debe ser un número válido"),
]

export const actualizarArriendoValidation = [
  body("fecha").optional().isISO8601().withMessage("La fecha debe ser una fecha válida"),

  body("montoTotal").optional().isFloat({ min: 0 }).withMessage("El monto total debe ser un número positivo"),

  body("obra").optional().isLength({ min: 2, max: 500 }).withMessage("La obra debe tener entre 2 y 500 caracteres"),

  body("observaciones")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Las observaciones no pueden exceder 1000 caracteres"),

  body("telefonoEmergencia")
    .optional()
    .isMobilePhone("es-CL")
    .withMessage("El teléfono de emergencia debe ser un número válido"),
]

export const finalizarArriendoValidation = [
  body("kilometrajeFinal").isInt({ min: 0 }).withMessage("El kilometraje final debe ser un número entero positivo"),
]

export const idValidation = [param("id").isInt({ min: 1 }).withMessage("El ID debe ser un número entero positivo")]

export const fechaValidation = [param("fecha").isISO8601().withMessage("La fecha debe ser una fecha válida")]

export const fechaRangoValidation = [
  query("fechaInicio").isISO8601().withMessage("La fecha de inicio debe ser una fecha válida"),

  query("fechaFin")
    .isISO8601()
    .withMessage("La fecha de fin debe ser una fecha válida")
    .custom((value, { req }) => {
      // SOLUCIÓN: Verificar que req.query existe y tiene los valores necesarios
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
