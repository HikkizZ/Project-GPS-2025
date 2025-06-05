import { body } from "express-validator"
import { GrupoMaquinaria } from "../../entity/maquinaria/maquinaria.entity.js"
import { EstadoVenta } from "../../entity/maquinaria/ventaMaquinaria.entity.js"

export const validarCrearVentaMaquinaria = [
  body("patente").isString().isLength({ min: 6, max: 20 }).withMessage("La patente debe tener entre 6 y 20 caracteres"),

  body("grupo").isIn(Object.values(GrupoMaquinaria)).withMessage("Grupo de maquinaria inválido"),

  body("marca").isString().isLength({ min: 1, max: 100 }).withMessage("La marca debe tener entre 1 y 100 caracteres"),

  body("modelo").isString().isLength({ min: 1, max: 100 }).withMessage("El modelo debe tener entre 1 y 100 caracteres"),

  body("año")
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage("El año debe ser válido"),

  body("fechaCompra").isISO8601().withMessage("La fecha de compra debe ser válida"),

  body("valorCompra").isFloat({ min: 0 }).withMessage("El valor de compra debe ser mayor o igual a 0"),

  body("avaluoFiscal").isFloat({ min: 0 }).withMessage("El avalúo fiscal debe ser mayor o igual a 0"),

  body("numeroChasis")
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage("El número de chasis debe tener entre 1 y 100 caracteres"),

  body("kilometrajeInicial").isInt({ min: 0 }).withMessage("El kilometraje inicial debe ser mayor o igual a 0"),

  body("kilometrajeActual").isInt({ min: 0 }).withMessage("El kilometraje actual debe ser mayor o igual a 0"),

  body("valorVenta").isFloat({ min: 0 }).withMessage("El valor de venta debe ser mayor o igual a 0"),
]

export const validarActualizarVentaMaquinaria = [
  body("patente")
    .optional()
    .isString()
    .isLength({ min: 6, max: 20 })
    .withMessage("La patente debe tener entre 6 y 20 caracteres"),

  body("grupo").optional().isIn(Object.values(GrupoMaquinaria)).withMessage("Grupo de maquinaria inválido"),

  body("marca")
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage("La marca debe tener entre 1 y 100 caracteres"),

  body("modelo")
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage("El modelo debe tener entre 1 y 100 caracteres"),

  body("año")
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage("El año debe ser válido"),

  body("valorCompra").optional().isFloat({ min: 0 }).withMessage("El valor de compra debe ser mayor o igual a 0"),

  body("avaluoFiscal").optional().isFloat({ min: 0 }).withMessage("El avalúo fiscal debe ser mayor o igual a 0"),

  body("valorVenta").optional().isFloat({ min: 0 }).withMessage("El valor de venta debe ser mayor o igual a 0"),

  body("estadoVenta").optional().isIn(Object.values(EstadoVenta)).withMessage("Estado de venta inválido"),

  body("numeroChasis")
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage("El número de chasis debe tener entre 1 y 100 caracteres"),

  body("kilometrajeActual")
    .optional()
    .isInt({ min: 0 })
    .withMessage("El kilometraje actual debe ser mayor o igual a 0"),
]

export const validarTransferirAVentas = [
  body("maquinariaId").isInt({ min: 1 }).withMessage("El ID de maquinaria debe ser un número válido"),

  body("valorVenta").isFloat({ min: 0 }).withMessage("El valor de venta debe ser mayor o igual a 0"),
]

export const validarCompletarVenta = [
  body("nombre").isString().isLength({ min: 2, max: 100 }).withMessage("El nombre debe tener entre 2 y 100 caracteres"),

  body("rut")
    .optional()
    .isString()
    .isLength({ min: 8, max: 12 })
    .withMessage("El RUT debe tener entre 8 y 12 caracteres"),

  body("direccion")
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage("La dirección debe tener entre 1 y 200 caracteres"),

  body("telefono")
    .optional()
    .isString()
    .isLength({ min: 1, max: 20 })
    .withMessage("El teléfono debe tener entre 1 y 20 caracteres"),

  body("metodoPago")
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage("El método de pago debe tener entre 1 y 50 caracteres"),

  body("numeroFactura")
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage("El número de factura debe tener entre 1 y 100 caracteres"),

  body("observaciones").optional().isString().withMessage("Las observaciones deben ser texto válido"),
]
