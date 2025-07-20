import Joi from 'joi';

//Validación para crear un bono
export const CreateBonoValidation = Joi.object({
    nombreBono: Joi.string().trim().min(2).max(50).required().messages({
        'string.empty': 'El nombre del bono no puede estar vacío',
        'string.min': 'El nombre del bono debe tener al menos 2 caracteres',
        'string.max': 'El nombre del bono no puede superar los 50 caracteres',
        'any.required': 'El nombre del bono es requerido'
    }),
    
    monto: Joi.string().trim().min(5).max(10).required().messages({
        'string.empty': 'El monto no puede estar vacío',
        'string.min': 'El monto debe tener al menos 5 caracteres',
        'string.max': 'El monto no puede superar los 10 caracteres',
        'any.required': 'El monto es requerido'
    }),
    tipoBono: Joi.string().valid('estatal', 'empresarial').default('empresarial').messages({
        'any.only': 'El tipo de bono debe ser "estatal" o "empresarial"',
        'any.default': 'El tipo de bono es requerido'
    }),
    temporalidad: Joi.string().valid('permanente', 'recurrente', 'puntual').default('puntual').messages({
        'any.only': 'La temporalidad debe ser "permanente", "recurrente" o "puntual"',
        'any.default': 'La temporalidad es requerida'
    }),
    descripcion: Joi.string().trim().max(500).optional().allow('').messages({
        'string.max': 'La descripción no puede superar los 500 caracteres'
    }),
    
    fechaCreacion: Joi.date().iso().default(() => new Date()).messages({
        'date.base': 'La fecha de creación debe ser una fecha válida',
        'date.format': 'La fecha de creación debe estar en formato ISO (YYYY-MM-DD)',
        'any.default': 'La fecha de creación es requerida'
    }),
    imponible: Joi.boolean().default(true).messages({
        'boolean.base': 'El estado imponible debe ser un booleano',
        'any.default': 'El estado imponible es requerido'
    }),

    duracionMes: Joi.number().integer().min(1).optional().messages({
        'number.base': 'La duración en meses debe ser un número entero',
        'number.integer': 'La duración en meses debe ser un número entero',
        'number.min': 'La duración en meses debe ser al menos 1'
    })
});

//Validación para asignar un bono 
//no es necesario que un trabajador tenga un bono asignado ni tampoco que un bono tenga un trabajador asignado
//esto es porque un bono puede ser asignado a un trabajador en cualquier momento y un trabajador
//puede recibir bonos en diferentes momentos, por lo que no es necesario que exista una relación directa
//entre un bono y un trabajador en la base de datos, sino que se puede asignar
export const AsignarBonoValidation = Joi.object({

    bonoId: Joi.number().integer().positive().required().messages({
        'number.base': 'El ID del bono debe ser un número',
        'number.integer': 'El ID del bono debe ser un número entero',
        'number.positive': 'El ID del bono debe ser positivo',
        'any.required': 'El ID del bono es requerido'
    }),
    
    observaciones: Joi.string().trim().max(500).optional().allow('').messages({
        'string.max': 'Las observaciones no pueden superar los 500 caracteres'
    })
});

// Validación para actualizar un bono
export const UpdateBonoValidation = Joi.object({
    nombreBono: Joi.string().trim().min(2).max(50).optional().messages({
        'string.empty': 'El nombre del bono no puede estar vacío',
        'string.min': 'El nombre del bono debe tener al menos 2 caracteres',
        'string.max': 'El nombre del bono no puede superar los 50 caracteres'
    }),
    
    monto: Joi.string().trim().min(5).max(10).optional().messages({
        'string.empty': 'El monto no puede estar vacío',
        'string.min': 'El monto debe tener al menos 5 caracteres',
        'string.max': 'El monto no puede superar los 10 caracteres'
    }),
    tipoBono: Joi.string().valid('estatal', 'empresarial').default('empresarial').messages({
        'any.only': 'El tipo de bono debe ser "estatal" o "empresarial"',
        'any.default': 'El tipo de bono es requerido'
    }),
    temporalidad: Joi.string().valid('permanente', 'recurrente', 'puntual').default('puntual').messages({
        'any.only': 'La temporalidad debe ser "permanente", "recurrente" o "puntual"',
        'any.default': 'La temporalidad es requerida'
    }),
    descripcion: Joi.string().trim().max(500).optional().allow('').messages({
        'string.max': 'La descripción no puede superar los 500 caracteres'
    }),
    fechaCreacion: Joi.date().iso().optional().messages({
        'date.base': 'La fecha de creación debe ser una fecha válida',
        'date.format': 'La fecha de creación debe estar en formato ISO (YYYY-MM-DD)'
    }),
    imponible: Joi.boolean().optional().messages({
        'boolean.base': 'El estado imponible debe ser un booleano'
    }),
    duracionMes: Joi.number().integer().min(1).optional().messages({
        'number.base': 'La duración en meses debe ser un número entero',
        'number.integer': 'La duración en meses debe ser un número entero',
        'number.min': 'La duración en meses debe ser al menos 1'
    })
});

// Validación para actualizar una asignación de bono
export const UpdateAsignarBonoValidation = Joi.object({
    
    bonoId: Joi.number().integer().positive().optional().messages({
        'number.base': 'El ID del bono debe ser un número',
        'number.integer': 'El ID del bono debe ser un número entero',
        'number.positive': 'El ID del bono debe ser positivo'
    }),
    
    activo: Joi.boolean().optional(),
    
    observaciones: Joi.string().trim().max(500).optional().allow('').messages({
        'string.max': 'Las observaciones no pueden superar los 500 caracteres'
    })
});

//Validacion de query para obtener bonos
//page y limit aún lo tengo en opcional porque no estoy seguro de como hacer que se vean en frontend
export const BonoQueryValidation = Joi.object({
    id: Joi.number().integer().positive().optional().messages({
        'number.base': 'El ID del bono debe ser un número',
        'number.integer': 'El ID del bono debe ser un número entero',
        'number.positive': 'El ID del bono debe ser positivo'
    }),
    nombreBono: Joi.string().trim().optional().messages({
        'string.base': 'El nombre del bono debe ser texto'
    }),
    tipoBono: Joi.string().valid('estatal', 'empresarial').optional().messages({
        'any.only': 'El tipo de bono debe ser "estatal" o "empresarial"'
    }),
    temporalidad: Joi.string().valid('permanente', 'recurrente', 'puntual').optional().messages({
        'any.only': 'La temporalidad debe ser "permanente", "recurrente" o "puntual"'
    }),
    fechaCreacionDesde: Joi.date().iso().optional().messages({
        'date.base': 'La fecha desde debe ser una fecha válida',
        'date.format': 'La fecha desde debe estar en formato ISO (YYYY-MM-DD)'
    }),
    fechaCreacionHasta: Joi.date().iso().optional().messages({
        'date.base': 'La fecha hasta debe ser una fecha válida',
        'date.format': 'La fecha hasta debe estar en formato ISO (YYYY-MM-DD)'
    }),
    page: Joi.number().integer().min(1).default(1).optional().messages({
        'number.base': 'El número de página debe ser un número',
        'number.integer': 'El número de página debe ser un número entero',
        'number.min': 'El número de página debe ser al menos 1'
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).optional().messages({
        'number.base': 'El límite debe ser un número',
        'number.integer': 'El límite debe ser un número entero',
        'number.min': 'El límite debe ser al menos 1',
        'number.max': 'El límite no puede superar 100'
    }),
    activo: Joi.boolean().optional().messages({
        'boolean.base': 'El estado activo debe ser un booleano'
    }),
    imponible: Joi.boolean().optional().messages({
        'boolean.base': 'El estado imponible debe ser un booleano'
    })
})
.or('id', 'nombreBono', 'tipoBono', 'temporalidad', 'fechaCreacionDesde', 'fechaCreacionHasta', 'activo', 'imponible')
.unknown(false)
.messages({
    'object.unknown': 'Parámetro no permitido en la consulta',
    'object.missing': 'Al menos uno de los parámetros debe ser proporcionado'
});

// Validación de query para obtener asignaciones de bonos
// page y limit aún lo tengo en opcional porque no estoy seguro de como hacer que se vean en frontend
export const AsignarBonoQueryValidation = Joi.object({
    
    fichaId: Joi.number().integer().positive().optional().messages({
        'number.base': 'El ID de la ficha debe ser un número',
        'number.integer': 'El ID de la ficha debe ser un número entero',
        'number.positive': 'El ID de la ficha debe ser positivo'
    }),
    
    bonoId: Joi.number().integer().positive().optional().messages({
        'number.base': 'El ID del bono debe ser un número',
        'number.integer': 'El ID del bono debe ser un número entero',
        'number.positive': 'El ID del bono debe ser positivo'
    }),

    fechaAsignacion: Joi.date().iso().optional().messages({
        'date.base': 'La fecha de asignación debe ser una fecha válida',
        'date.format': 'La fecha de asignación debe estar en formato ISO (YYYY-MM-DD)'
    }),
    
    activo: Joi.boolean().optional()
})
.or('trabajadorId', 'bonoId', 'fechaAsignacion', 'activo')
.unknown(false)
.messages({
    'object.unknown': 'Parámetro no permitido en la consulta',
    'object.missing': 'Al menos uno de los parámetros debe ser proporcionado'
}); 