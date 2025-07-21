import Joi from "joi";

/* Query validation para búsqueda de historial laboral */
export const HistorialLaboralQueryValidation = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .messages({
            "number.base": "El ID debe ser un número.",
            "number.integer": "El ID debe ser un número entero.",
            "number.positive": "El ID debe ser un número positivo."
        }),
    trabajadorId: Joi.number()
        .integer()
        .positive()
        .messages({
            "number.base": "El ID del trabajador debe ser un número.",
            "number.integer": "El ID del trabajador debe ser un número entero.",
            "number.positive": "El ID del trabajador debe ser un número positivo."
        })
})
.or('id', 'trabajadorId')
.unknown(false)
.messages({
    "object.unknown": "El objeto contiene campos no permitidos.",
    "object.missing": "Se requiere al menos uno de los siguientes campos: id o trabajadorId."
});