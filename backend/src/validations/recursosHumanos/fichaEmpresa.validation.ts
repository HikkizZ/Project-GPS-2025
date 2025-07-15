import Joi from "joi";
import { EstadoLaboral } from "../../entity/recursosHumanos/fichaEmpresa.entity.js";

/* Query validation para búsqueda de fichas de empresa */
export const FichaEmpresaQueryValidation = Joi.object({
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
    estado: Joi.string()
        .valid(...Object.values(EstadoLaboral))
        .messages({
            "any.only": "El estado laboral no es válido.",
            "string.base": "El estado laboral debe ser una cadena de texto."
        }),
    sueldoBaseDesde: Joi.number()
        .integer()
        .min(1)
        .messages({
            "number.base": "El sueldo desde debe ser un número.",
            "number.integer": "El sueldo desde debe ser un número entero.",
            "number.min": "El sueldo desde debe ser mayor a 0."
        }),
    sueldoBaseHasta: Joi.number()
        .integer()
        .min(1)
        .messages({
            "number.base": "El sueldo hasta debe ser un número.",
            "number.integer": "El sueldo hasta debe ser un número entero.",
            "number.min": "El sueldo hasta debe ser mayor a 0."
        })
})
.or('id', 'trabajadorId', 'estado')
.unknown(false)
.messages({
    "object.unknown": "El objeto contiene campos no permitidos.",
    "object.missing": "Se requiere al menos uno de los siguientes campos: id, trabajadorId o estado."
});

/* Body validation para actualización de ficha de empresa */
export const FichaEmpresaBodyValidation = Joi.object({
    //Asignacion de bonos
    asignacionesBonos: Joi.array()
    .items(Joi.string().trim()) // O Joi.number() si los IDs son numéricos
    .messages({
        "array.base": "Las asignaciones de bonos deben ser un arreglo",
        "string.base": "Cada bono debe ser un identificador válido"
    })
    .optional()
    .allow(null, ''), // Permitir que sea null o una cadena vacía

    cargo: Joi.string()
        .min(3)
        .max(100)
        .messages({
            "string.base": "El cargo debe ser una cadena de texto.",
            "string.min": "El cargo debe tener al menos 3 caracteres.",
            "string.max": "El cargo no puede exceder los 100 caracteres."
        }),

    area: Joi.string()
        .min(3)
        .max(100)
        .messages({
            "string.base": "El área debe ser una cadena de texto.",
            "string.min": "El área debe tener al menos 3 caracteres.",
            "string.max": "El área no puede exceder los 100 caracteres."
        }),

    tipoContrato: Joi.string()
        .min(2)
        .max(50)
        .messages({
            "string.base": "El tipo de contrato debe ser una cadena de texto",
            "string.min": "El tipo de contrato debe tener al menos 2 caracteres",
            "string.max": "El tipo de contrato no puede exceder los 50 caracteres"
        }),

    jornadaLaboral: Joi.string()
        .min(2)
        .max(50)
        .messages({
            "string.base": "La jornada laboral debe ser una cadena de texto",
            "string.min": "La jornada laboral debe tener al menos 2 caracteres",
            "string.max": "La jornada laboral no puede exceder los 50 caracteres"
        }),

    sueldoBase: Joi.number()
        .min(1)
        .messages({
            "number.base": "El sueldo base debe ser mayor a 0",
            "number.min": "El sueldo base debe ser mayor a 0"
        }),

    previsionSalud: Joi.string()
        .valid('FONASA', 'ISAPRE')
        .messages({
            "any.only": "La previsión de salud debe ser FONASA o ISAPRE",
            "string.base": "La previsión de salud debe ser una cadena de texto"
        }),

    afp: Joi.string()
        .valid(  'habitat',   'provida',   'modelo',   'cuprum',   'capital',   'planvital',   'uno') 
        .messages({
            "any.only": "La AFP debe ser una de las opciones válidas",
            "string.base": "La AFP debe ser una cadena de texto"
        }),

    seguroCesantia: Joi.boolean()
        .messages({
            "boolean.base": "El seguro de cesantía debe ser un valor booleano (true o false)"
        }),

    fechaInicioContrato: Joi.date()
        .iso()
        .messages({
            "date.base": "La fecha de inicio debe ser una fecha válida.",
            "date.format": "La fecha de inicio debe estar en formato YYYY-MM-DD"
        }),

    fechaFinContrato: Joi.date()
        .iso()
        .min(Joi.ref('fechaInicioContrato'))
        .allow(null, '')
        .messages({
            "date.base": "La fecha de fin de contrato debe ser una fecha válida",
            "date.format": "La fecha de fin de contrato debe estar en formato YYYY-MM-DD",
            "date.min": "La fecha de fin de contrato no puede ser anterior a la fecha de inicio"
        }),

    estado: Joi.string()
        .valid(...Object.values(EstadoLaboral))
        .messages({
            "any.only": "El estado laboral no es válido.",
            "string.base": "El estado laboral debe ser una cadena de texto."
        }),

    contratoURL: Joi.string()
        .uri()
        .allow(null, '')
        .messages({
            "string.uri": "La URL del contrato debe ser una URL válida",
            "string.base": "La URL del contrato debe ser una cadena de texto"
        })
});

export const FichaEmpresaUpdateValidation = Joi.object({
    //Asignacion de bonos
    asignacionesBonos: Joi.array()
    .items(Joi.string().trim()) // O Joi.number() si los IDs son numéricos
    .messages({
        "array.base": "Las asignaciones de bonos deben ser un arreglo",
        "string.base": "Cada bono debe ser un identificador válido"
    })
    .optional()
    .allow(null, ''), // Permitir que sea null o una cadena vacía

    cargo: Joi.string()
        .min(3)
        .max(100)
        .messages({
            "string.base": "El cargo debe ser una cadena de texto",
            "string.min": "El cargo debe tener al menos 3 caracteres",
            "string.max": "El cargo no puede exceder los 100 caracteres"
        }),

    area: Joi.string()
        .min(2)
        .max(100)
        .messages({
            "string.base": "El área debe ser una cadena de texto",
            "string.min": "El área debe tener al menos 2 caracteres",
            "string.max": "El área no puede exceder los 100 caracteres"
        }),

    tipoContrato: Joi.string()
        .min(2)
        .max(50)
        .messages({
            "string.base": "El tipo de contrato debe ser una cadena de texto",
            "string.min": "El tipo de contrato debe tener al menos 2 caracteres",
            "string.max": "El tipo de contrato no puede exceder los 50 caracteres"
        }),

    jornadaLaboral: Joi.string()
        .min(2)
        .max(50)
        .messages({
            "string.base": "La jornada laboral debe ser una cadena de texto",
            "string.min": "La jornada laboral debe tener al menos 2 caracteres",
            "string.max": "La jornada laboral no puede exceder los 50 caracteres"
        }),

    sueldoBase: Joi.number()
        .min(1)
        .messages({
            "number.base": "El sueldo base debe ser mayor a 0",
            "number.min": "El sueldo base debe ser mayor a 0"
        }),

    previsionSalud: Joi.string()
        .valid('FONASA', 'ISAPRE')
        .messages({
            "any.only": "La previsión de salud debe ser FONASA o ISAPRE",
            "string.base": "La previsión de salud debe ser una cadena de texto"
        }),

    afp: Joi.string()
        .valid(  'habitat',   'provida',   'modelo',   'cuprum',   'capital',   'planvital',   'uno') 
        .messages({
            "any.only": "La AFP debe ser una de las opciones válidas",
            "string.base": "La AFP debe ser una cadena de texto"
        }),

    seguroCesantia: Joi.boolean()
        .messages({
            "boolean.base": "El seguro de cesantía debe ser un valor booleano (true o false)"
        }),

    fechaInicioContrato: Joi.date()
        .iso()
        .messages({
            "date.base": "La fecha de inicio de contrato debe ser una fecha válida",
            "date.format": "La fecha de inicio de contrato debe estar en formato YYYY-MM-DD"
        }),

    fechaFinContrato: Joi.date()
        .iso()
        .allow(null, '')
        .messages({
            "date.base": "La fecha de fin de contrato debe ser una fecha válida",
            "date.format": "La fecha de fin de contrato debe estar en formato YYYY-MM-DD"
        }),

    contratoURL: Joi.string()
        .uri()
        .allow(null, '')
        .messages({
            "string.uri": "La URL del contrato debe ser una URL válida",
            "string.base": "La URL del contrato debe ser una cadena de texto"
        })
}).min(1).messages({
    "object.min": "Debe proporcionar al menos un campo para actualizar"
});

export const EstadoFichaValidation = Joi.object({
    estado: Joi.string()
        .valid(...Object.values(EstadoLaboral))
        .required()
        .messages({
            "any.required": "El estado es requerido",
            "any.only": "El estado laboral no es válido",
            "string.base": "El estado laboral debe ser una cadena de texto"
        }),

    motivo: Joi.string()
        .when('estado', {
            is: EstadoLaboral.DESVINCULADO,
            then: Joi.string()
                .required()
                .min(3)
                .max(500)
                .messages({
                    "any.required": "El motivo de desvinculación es requerido",
                    "string.min": "El motivo debe tener al menos 3 caracteres",
                    "string.max": "El motivo no puede exceder los 500 caracteres",
                    "string.base": "El motivo debe ser una cadena de texto"
                })
        })
        .messages({
            "string.base": "El motivo debe ser una cadena de texto"
        }),

    fechaInicio: Joi.date()
        .iso()
        .messages({
            "date.base": "La fecha de inicio debe ser una fecha válida",
            "date.format": "La fecha de inicio debe estar en formato YYYY-MM-DD"
        }),

    fechaFin: Joi.date()
        .iso()
        .min(Joi.ref('fechaInicio'))
        .messages({
            "date.base": "La fecha de fin debe ser una fecha válida",
            "date.format": "La fecha de fin debe estar en formato YYYY-MM-DD",
            "date.min": "La fecha de fin no puede ser anterior a la fecha de inicio"
        })
}); 
