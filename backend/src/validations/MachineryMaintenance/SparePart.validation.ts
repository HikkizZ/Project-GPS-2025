import Joi from "joi";
import { GrupoMaquinaria } from "../../entity/maquinaria/maquinaria.entity.js";

const gruposValidos = Object.values(GrupoMaquinaria);

export const createSparePartValidation = Joi.object({
  nombre: Joi.string()
    .max(100)
    .required()
    .messages({
      "any.required": "El nombre del repuesto es obligatorio.",
      "string.base": "El nombre debe ser texto.",
      "string.max": "El nombre no debe superar los 100 caracteres."
    }),

  stock: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      "any.required": "El stock es obligatorio.",
      "number.base": "El stock debe ser un número entero.",
      "number.integer": "El stock debe ser un número entero.",
      "number.min": "El stock no puede ser negativo."
    }),

  marca: Joi.string()
    .max(100)
    .required()
    .messages({
      "any.required": "La marca es obligatoria.",
      "string.base": "La marca debe ser texto.",
      "string.max": "La marca no debe superar los 100 caracteres."
    }),

  modelo: Joi.string()
    .max(100)
    .required()
    .messages({
      "any.required": "El modelo es obligatorio.",
      "string.base": "El modelo debe ser texto.",
      "string.max": "El modelo no debe superar los 100 caracteres."
    }),

  anio: Joi.number()
    .integer()
    .min(1950)
    .max(new Date().getFullYear() + 1)
    .required()
    .messages({
      "any.required": "El año es obligatorio.",
      "number.base": "El año debe ser un número.",
      "number.integer": "El año debe ser un número entero.",
      "number.min": "El año no puede ser anterior a 1950.",
      "number.max": `El año no puede ser mayor a ${new Date().getFullYear() + 1}.`
    }),

  grupo: Joi.string()
    .valid(...gruposValidos)
    .required()
    .messages({
      "any.required": "El grupo es obligatorio.",
      "any.only": `El grupo debe ser uno de: ${gruposValidos.join(", ")}.`
    })
}).messages({
  "object.unknown": "No se permiten propiedades adicionales."
});

export const updateSparePartValidation = Joi.object({
  nombre: Joi.string()
    .max(100)
    .messages({
      "string.base": "El nombre debe ser texto.",
      "string.max": "El nombre no debe superar los 100 caracteres."
    }),

  stock: Joi.number()
    .integer()
    .min(0)
    .messages({
      "number.base": "El stock debe ser un número entero.",
      "number.integer": "El stock debe ser un número entero.",
      "number.min": "El stock no puede ser negativo."
    }),

  marca: Joi.string()
    .max(100)
    .messages({
      "string.base": "La marca debe ser texto.",
      "string.max": "La marca no debe superar los 100 caracteres."
    }),

  modelo: Joi.string()
    .max(100)
    .messages({
      "string.base": "El modelo debe ser texto.",
      "string.max": "El modelo no debe superar los 100 caracteres."
    }),

  anio: Joi.number()
    .integer()
    .min(1950)
    .max(new Date().getFullYear() + 1)
    .messages({
      "number.base": "El año debe ser un número.",
      "number.integer": "El año debe ser un número entero.",
      "number.min": "El año no puede ser anterior a 1950.",
      "number.max": `El año no puede ser mayor a ${new Date().getFullYear() + 1}.`
    }),

  grupo: Joi.string()
    .valid(...gruposValidos)
    .messages({
      "any.only": `El grupo debe ser uno de: ${gruposValidos.join(", ")}.`
    })

}).or("nombre", "stock", "marca", "modelo", "anio", "grupo").messages({
  "object.unknown": "No se permiten propiedades adicionales.",
  "object.missing": "Debes proporcionar al menos un campo para actualizar."
});

export const sparePartQueryValidation = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.base": "El ID debe ser un número.",
      "number.integer": "El ID debe ser un número entero.",
      "number.positive": "El ID debe ser mayor a cero.",
      "any.required": "El parámetro 'id' es obligatorio."
    })
}).messages({
  "object.unknown": "No se permiten propiedades adicionales."
});
