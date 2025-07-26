import Joi from "joi";

export const createMaintenanceRecordValidation = Joi.object({
  maquinariaId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "any.required": "El ID de la maquinaria es obligatorio.",
      "number.base": "El ID debe ser un número.",
      "number.integer": "El ID debe ser entero.",
      "number.positive": "El ID debe ser mayor a cero."
    }),

  razonMantencion: Joi.string()
    .valid("kilometraje", "rutina", "falla")
    .required()
    .messages({
      "any.required": "La razón de mantención es obligatoria.",
      "any.only": "La razón debe ser 'kilometraje', 'rutina' o 'falla'."
    }),

  descripcionEntrada: Joi.string()
    .min(5)
    .required()
    .messages({
      "any.required": "La descripción de entrada es obligatoria.",
      "string.base": "La descripción debe ser texto.",
      "string.min": "La descripción debe tener al menos 5 caracteres."
    }),

  

  repuestosUtilizados: Joi.array().items(
    Joi.object({
      repuestoId: Joi.number().integer().positive().required()
        .messages({
          "any.required": "El ID del repuesto es obligatorio.",
          "number.base": "El ID del repuesto debe ser un número.",
          "number.integer": "El ID del repuesto debe ser entero.",
          "number.positive": "El ID del repuesto debe ser mayor a cero."
        }),
      cantidad: Joi.number().integer().min(1).required()
        .messages({
          "any.required": "La cantidad es obligatoria.",
          "number.base": "La cantidad debe ser un número.",
          "number.integer": "La cantidad debe ser entera.",
          "number.min": "La cantidad mínima es 1."
        })
    })
  ).required()
    .messages({
      "array.base": "Los repuestos utilizados deben ser una lista válida.",
      "any.required": "Debes proporcionar al menos un repuesto utilizado."
    })
}).messages({
  "object.unknown": "No se permiten propiedades adicionales."
});

export const updateMaintenanceRecordValidation = Joi.object({
  maquinariaId: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El ID de la maquinaria debe ser un número.",
      "number.integer": "El ID de la maquinaria debe ser un número entero.",
      "number.positive": "El ID de la maquinaria debe ser mayor a cero."
    }),

  razonMantencion: Joi.string()
    .valid("kilometraje", "rutina", "falla")
    .messages({
      "any.only": "La razón debe ser 'kilometraje', 'rutina' o 'falla'."
    }),

  descripcionEntrada: Joi.string()
    .min(5)
    .messages({
      "string.base": "La descripción debe ser texto.",
      "string.min": "La descripción debe tener al menos 5 caracteres."
    }),

  mecanicoId: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El ID del mecánico debe ser un número.",
      "number.integer": "El ID del mecánico debe ser un número entero.",
      "number.positive": "El ID del mecánico debe ser mayor a cero."
    }),

  estado: Joi.string()
    .valid("pendiente", "en_proceso", "completada", "irrecuperable")
    .messages({
      "any.only": "El estado debe ser 'pendiente', 'en_proceso', 'completada' o 'irrecuperable'."
    }),

  fechaSalida: Joi.date()
    .messages({
      "date.base": "La fecha de salida debe ser una fecha válida."
    }),

  descripcionSalida: Joi.string()
    .min(5)
    .messages({
      "string.base": "La descripción debe ser texto.",
      "string.min": "La descripción debe tener al menos 5 caracteres."
    }),

  repuestosUtilizados: Joi.array().items(
    Joi.object({
      repuestoId: Joi.number().integer().positive().required()
        .messages({
          "any.required": "El ID del repuesto es obligatorio.",
          "number.base": "El ID del repuesto debe ser un número.",
          "number.integer": "El ID del repuesto debe ser entero.",
          "number.positive": "El ID del repuesto debe ser mayor a cero."
        }),
      cantidad: Joi.number().integer().min(1).required()
        .messages({
          "any.required": "La cantidad es obligatoria.",
          "number.base": "La cantidad debe ser un número.",
          "number.integer": "La cantidad debe ser entera.",
          "number.min": "La cantidad mínima es 1."
        })
    })
  )
}).or(
  "maquinariaId",
  "razonMantencion",
  "descripcionEntrada",
  "mecanicoId",
  "estado",
  "fechaSalida",
  "descripcionSalida",
  "repuestosUtilizados"
).messages({
  "object.unknown": "No se permiten propiedades adicionales.",
  "object.missing": "Debes proporcionar al menos un campo para actualizar."
});

export const maintenanceRecordQueryValidation = Joi.object({
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
