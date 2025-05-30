import Joi from 'joi';

// Validación para crear una capacitación
export const CreateCapacitacionValidation = Joi.object({
    trabajadorId: Joi.number().integer().positive().optional().messages({
        'number.base': 'El ID del trabajador debe ser un número',
        'number.integer': 'El ID del trabajador debe ser un número entero',
        'number.positive': 'El ID del trabajador debe ser positivo'
    }),
    
    nombreCurso: Joi.string().trim().min(2).max(200).required().messages({
        'string.empty': 'El nombre del curso no puede estar vacío',
        'string.min': 'El nombre del curso debe tener al menos 2 caracteres',
        'string.max': 'El nombre del curso no puede superar los 200 caracteres',
        'any.required': 'El nombre del curso es requerido'
    }),
    
    institucion: Joi.string().trim().min(2).max(200).required().messages({
        'string.empty': 'La institución no puede estar vacía',
        'string.min': 'La institución debe tener al menos 2 caracteres',
        'string.max': 'La institución no puede superar los 200 caracteres',
        'any.required': 'La institución es requerida'
    }),
    
    fecha: Joi.date().iso().required().messages({
        'date.base': 'La fecha debe ser una fecha válida',
        'date.format': 'La fecha debe estar en formato ISO (YYYY-MM-DD)',
        'any.required': 'La fecha es requerida'
    }),
    
    duracion: Joi.string().trim().min(1).max(50).required().messages({
        'string.empty': 'La duración no puede estar vacía',
        'string.min': 'La duración debe tener al menos 1 caracter',
        'string.max': 'La duración no puede superar los 50 caracteres',
        'any.required': 'La duración es requerida'
    }),
    
    certificadoURL: Joi.string().trim().uri().optional().allow('').messages({
        'string.uri': 'El certificado debe ser una URL válida'
    }),

    // Para archivos adjuntos
    archivoInfo: Joi.object({
        filename: Joi.string(),
        path: Joi.string(),
        size: Joi.number(),
        originalName: Joi.string()
    }).optional()
});

// Validación para actualizar una capacitación
export const UpdateCapacitacionValidation = Joi.object({
    nombreCurso: Joi.string().trim().min(2).max(200).optional().messages({
        'string.empty': 'El nombre del curso no puede estar vacío',
        'string.min': 'El nombre del curso debe tener al menos 2 caracteres',
        'string.max': 'El nombre del curso no puede superar los 200 caracteres'
    }),
    
    institucion: Joi.string().trim().min(2).max(200).optional().messages({
        'string.empty': 'La institución no puede estar vacía',
        'string.min': 'La institución debe tener al menos 2 caracteres',
        'string.max': 'La institución no puede superar los 200 caracteres'
    }),
    
    fecha: Joi.date().iso().max('now').optional().messages({
        'date.base': 'La fecha debe ser una fecha válida',
        'date.format': 'La fecha debe estar en formato ISO (YYYY-MM-DD)',
        'date.max': 'La fecha no puede ser futura'
    }),
    
    duracion: Joi.string().trim().min(1).max(50).optional().messages({
        'string.empty': 'La duración no puede estar vacía',
        'string.min': 'La duración debe tener al menos 1 caracter',
        'string.max': 'La duración no puede superar los 50 caracteres'
    }),
    
    certificadoURL: Joi.string().trim().uri().optional().allow('').messages({
        'string.uri': 'El certificado debe ser una URL válida'
    })
});

// Validación para queries de búsqueda
export const CapacitacionQueryValidation = Joi.object({
    id: Joi.number().integer().positive().optional().messages({
        'number.base': 'El ID debe ser un número',
        'number.integer': 'El ID debe ser un número entero',
        'number.positive': 'El ID debe ser positivo'
    }),
    
    trabajadorId: Joi.number().integer().positive().optional().messages({
        'number.base': 'El ID del trabajador debe ser un número',
        'number.integer': 'El ID del trabajador debe ser un número entero',
        'number.positive': 'El ID del trabajador debe ser positivo'
    }),
    
    institucion: Joi.string().trim().optional().messages({
        'string.base': 'La institución debe ser texto'
    }),
    
    fechaDesde: Joi.date().iso().optional().messages({
        'date.base': 'La fecha desde debe ser una fecha válida',
        'date.format': 'La fecha desde debe estar en formato ISO (YYYY-MM-DD)'
    }),
    
    fechaHasta: Joi.date().iso().optional().messages({
        'date.base': 'La fecha hasta debe ser una fecha válida',
        'date.format': 'La fecha hasta debe estar en formato ISO (YYYY-MM-DD)'
    }),
    
    limit: Joi.number().integer().min(1).max(100).optional().default(10).messages({
        'number.base': 'El límite debe ser un número',
        'number.integer': 'El límite debe ser un número entero',
        'number.min': 'El límite mínimo es 1',
        'number.max': 'El límite máximo es 100'
    }),
    
    offset: Joi.number().integer().min(0).optional().default(0).messages({
        'number.base': 'El offset debe ser un número',
        'number.integer': 'El offset debe ser un número entero',
        'number.min': 'El offset mínimo es 0'
    })
}); 