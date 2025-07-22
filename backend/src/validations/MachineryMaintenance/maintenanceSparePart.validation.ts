import Joi from 'joi';

export const createMaintenanceSparePartValidation = Joi.object({
  repuestoId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'any.required': 'El ID del repuesto es obligatorio.',
      'number.base': 'El ID del repuesto debe ser un número.',
      'number.integer': 'El ID del repuesto debe ser un número entero.',
      'number.positive': 'El ID del repuesto debe ser mayor a cero.'
    }),

  mantencionId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'any.required': 'El ID de la mantención es obligatorio.',
      'number.base': 'El ID de la mantención debe ser un número.',
      'number.integer': 'El ID de la mantención debe ser un número entero.',
      'number.positive': 'El ID de la mantención debe ser mayor a cero.'
    }),

  cantidadUtilizada: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'any.required': 'La cantidad utilizada es obligatoria.',
      'number.base': 'La cantidad utilizada debe ser un número.',
      'number.integer': 'La cantidad debe ser un número entero.',
      'number.min': 'Debe utilizarse al menos una unidad.'
    })
}).messages({
  'object.unknown': 'No se permiten propiedades adicionales.'
});

export const updateMaintenanceSparePartValidation = Joi.object({
  cantidadUtilizada: Joi.number()
    .integer()
    .min(1)
    .messages({
      "number.base": "La cantidad utilizada debe ser un número.",
      "number.integer": "La cantidad debe ser un número entero.",
      "number.min": "Debe utilizarse al menos una unidad."
    })
}).or("cantidadUtilizada").messages({
  "object.unknown": "No se permiten propiedades adicionales.",
  "object.missing": "Debes proporcionar al menos un campo para actualizar."
});


export const maintenanceSparePartQueryValidation = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'El ID debe ser un número.',
      'number.integer': 'El ID debe ser un número entero.',
      'number.positive': 'El ID debe ser mayor a cero.',
      'any.required': 'El parámetro "id" es obligatorio.'
    })
}).messages({
  'object.unknown': 'No se permiten propiedades adicionales.'
});
