import Joi from "joi";
import { TipoSolicitud, EstadoSolicitud } from "../../entity/recursosHumanos/licenciaPermiso.entity.js";

/* Query validation para búsqueda de licencias/permisos */
export const LicenciaPermisoQueryValidation = Joi.object({
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
        }),
    tipo: Joi.string()
        .valid(...Object.values(TipoSolicitud))
        .messages({
            "any.only": "El tipo de solicitud no es válido.",
            "string.base": "El tipo de solicitud debe ser una cadena de texto."
        }),
    estado: Joi.string()
        .valid(...Object.values(EstadoSolicitud))
        .messages({
            "any.only": "El estado de la solicitud no es válido.",
            "string.base": "El estado de la solicitud debe ser una cadena de texto."
        })
})
.or('id', 'trabajadorId', 'tipo', 'estado')
.unknown(false)
.messages({
    "object.unknown": "El objeto contiene campos no permitidos.",
    "object.missing": "Se requiere al menos uno de los siguientes campos: id, trabajadorId, tipo o estado."
});

/* Body validation para creación y actualización de licencias/permisos */
export const LicenciaPermisoBodyValidation = Joi.object({
    trabajadorId: Joi.number()
        .integer()
        .positive()
        .messages({
            "number.base": "El ID del trabajador debe ser un número.",
            "number.integer": "El ID del trabajador debe ser un número entero.",
            "number.positive": "El ID del trabajador debe ser un número positivo."
        }),

    tipo: Joi.string()
        .valid(...Object.values(TipoSolicitud))
        .messages({
            "any.only": "El tipo de solicitud no es válido.",
            "string.base": "El tipo de solicitud debe ser una cadena de texto."
        }),

    fechaInicio: Joi.date()
        .iso()
        .messages({
            "date.base": "La fecha de inicio debe ser una fecha válida.",
            "date.format": "La fecha de inicio debe estar en formato YYYY-MM-DD"
        }),

    fechaFin: Joi.date()
        .iso()
        .min(Joi.ref('fechaInicio'))
        .messages({
            "date.base": "La fecha de fin debe ser una fecha válida.",
            "date.format": "La fecha de fin debe estar en formato YYYY-MM-DD",
            "date.min": "La fecha de fin debe ser posterior a la fecha de inicio"
        }),

    motivoSolicitud: Joi.string()
        .min(10)
        .max(500)
        .messages({
            "string.base": "El motivo debe ser una cadena de texto.",
            "string.min": "El motivo debe tener al menos 10 caracteres.",
            "string.max": "El motivo no puede exceder los 500 caracteres."
        }),

    estado: Joi.string()
        .valid(...Object.values(EstadoSolicitud))
        .messages({
            "any.only": "El estado de la solicitud no es válido.",
            "string.base": "El estado de la solicitud debe ser una cadena de texto."
        }),

    respuestaEncargado: Joi.string()
        .min(10)
        .max(500)
        .messages({
            "string.base": "La respuesta debe ser una cadena de texto.",
            "string.min": "La respuesta debe tener al menos 10 caracteres.",
            "string.max": "La respuesta no puede exceder los 500 caracteres."
        }),

    archivoAdjuntoURL: Joi.string()
        .uri()
        .allow('')
        .optional()
        .messages({
            "string.uri": "La URL del archivo adjunto no es válida."
        })
})
.when('.', {
    is: Joi.object().unknown(true),
    then: Joi.object({
        trabajadorId: Joi.required(),
        tipo: Joi.required(),
        fechaInicio: Joi.required(),
        fechaFin: Joi.required(),
        motivoSolicitud: Joi.required()
    }).messages({
        'any.required': 'Los campos trabajadorId, tipo, fechaInicio, fechaFin y motivoSolicitud son obligatorios para crear una solicitud.'
    })
}); 