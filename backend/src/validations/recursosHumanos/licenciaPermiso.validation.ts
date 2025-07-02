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

/* Body validation para creación de licencias/permisos */
export const CreateLicenciaPermisoValidation = Joi.object({
    trabajadorId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "El ID del trabajador debe ser un número.",
            "number.integer": "El ID del trabajador debe ser un número entero.",
            "number.positive": "El ID del trabajador debe ser un número positivo.",
            "any.required": "El ID del trabajador es requerido."
        }),

    tipo: Joi.string()
        .valid(...Object.values(TipoSolicitud))
        .required()
        .messages({
            "any.only": "El tipo de solicitud no es válido.",
            "string.base": "El tipo de solicitud debe ser una cadena de texto.",
            "any.required": "El tipo de solicitud es requerido."
        }),

    fechaInicio: Joi.date()
        .iso()
        .required()
        .messages({
            "date.base": "La fecha de inicio debe ser una fecha válida.",
            "date.format": "La fecha de inicio debe estar en formato YYYY-MM-DD",
            "any.required": "La fecha de inicio es requerida."
        }),

    fechaFin: Joi.date()
        .iso()
        .min(Joi.ref('fechaInicio'))
        .required()
        .messages({
            "date.base": "La fecha de fin debe ser una fecha válida.",
            "date.format": "La fecha de fin debe estar en formato YYYY-MM-DD",
            "date.min": "La fecha de fin debe ser posterior a la fecha de inicio.",
            "any.required": "La fecha de fin es requerida."
        }),

    motivoSolicitud: Joi.string()
        .min(10)
        .max(500)
        .required()
        .messages({
            "string.base": "El motivo debe ser una cadena de texto.",
            "string.min": "El motivo debe tener al menos 10 caracteres.",
            "string.max": "El motivo no puede exceder los 500 caracteres.",
            "any.required": "El motivo es requerido."
        }),

    archivoAdjuntoURL: Joi.string()
        .uri()
        .allow('')
        .optional()
        .messages({
            "string.uri": "La URL del archivo adjunto no es válida."
        }),

    file: Joi.any()
        .optional()
        .description("Archivo adjunto para licencias médicas")
});

/* Body validation para actualización de licencias/permisos */
export const UpdateLicenciaPermisoValidation = Joi.object({
    estadoSolicitud: Joi.string()
        .valid(...Object.values(EstadoSolicitud))
        .required()
        .messages({
            "any.only": "El estado de la solicitud no es válido.",
            "string.base": "El estado de la solicitud debe ser una cadena de texto.",
            "any.required": "El estado de la solicitud es requerido."
        }),

    respuestaEncargado: Joi.string()
        .max(500)
        .allow('')
        .optional()
        .messages({
            "string.base": "La respuesta debe ser una cadena de texto.",
            "string.max": "La respuesta no puede exceder los 500 caracteres."
        })
}); 