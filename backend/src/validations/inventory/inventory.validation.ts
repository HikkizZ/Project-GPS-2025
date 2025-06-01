import Joi, { ObjectSchema, CustomHelpers } from "joi";
import { validateRut } from "../../helpers/rut.helper.js";

/* Custom validator for RUT */
const rutValidator = (value: string, helper: CustomHelpers) => {
    if (!validateRut(value)) return helper.message({ custom: "El RUT ingresado no es válido." });
    return value;
}

/* Query validation for inventory entry */
export const inventoryQueryValidation: ObjectSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El ID debe ser un número.",
      "number.integer": "El ID debe ser un número entero.",
      "number.positive": "El ID debe ser un número positivo.",
    }),
}).unknown(false).messages({
  "object.unknown": "El objeto contiene campos no permitidos.",
  "object.missing": "Se requiere el campo 'id' para buscar una entrada específica.",
});

/* Detalle individual */
const inventoryEntryDetailSchema = Joi.object({
  productId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "any.required": "El ID del producto es obligatorio.",
      "number.base": "El ID del producto debe ser un número.",
      "number.integer": "El ID del producto debe ser un número entero.",
      "number.positive": "El ID del producto debe ser mayor a cero.",
    }),

  quantity: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "any.required": "La cantidad es obligatoria.",
      "number.base": "La cantidad debe ser un número.",
      "number.integer": "La cantidad debe ser un número entero.",
      "number.positive": "La cantidad debe ser mayor a cero.",
    }),

  purchasePrice: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "any.required": "El precio de compra es obligatorio.",
      "number.base": "El precio debe ser un número.",
      "number.integer": "El precio debe ser un número entero.",
      "number.positive": "El precio debe ser mayor a cero.",
    }),
});

/* Entrada principal */
export const createInventoryEntryValidation: ObjectSchema = Joi.object({
  supplierRut: Joi.string()
    .min(8)
    .max(12)
    .custom(rutValidator, "RUT validation")
    .required()
    .messages({
      "any.required": "El RUT del proveedor es obligatorio.",
      "string.base": "El RUT debe ser un texto.",
      "string.empty": "El RUT no puede estar vacío.",
      "string.min": "El RUT debe tener al menos 8 caracteres.",
      "string.max": "El RUT debe tener como máximo 12 caracteres.",
    }),

  details: Joi.array()
    .items(inventoryEntryDetailSchema)
    .min(1)
    .required()
    .messages({
      "array.base": "Los detalles deben ser un arreglo.",
      "array.min": "Debe haber al menos un producto en la entrada.",
      "any.required": "Los detalles de la entrada son obligatorios.",
    }),
}).messages({
  "object.base": "El cuerpo de la solicitud debe ser un objeto válido.",
});
