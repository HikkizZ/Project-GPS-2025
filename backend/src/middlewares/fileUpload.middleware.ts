import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { promisify } from 'util';

// Configuración de multer con estructura de carpetas organizada
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Determinar la carpeta según el tipo de archivo
        let uploadDir = 'uploads/';
        
        if (req.baseUrl.includes('licencia-permiso')) {
            uploadDir += 'licencias/';
        } else if (req.baseUrl.includes('ficha-empresa')) {
            uploadDir += 'contratos/';
        } else if (req.baseUrl.includes('historial-laboral')) {
            uploadDir += 'historial/';
        } else if (req.baseUrl.includes('capacitacion')) {
            uploadDir += 'certificados/';
        } else {
            uploadDir += 'general/';
        }

        // Crear el directorio si no existe
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${uniqueSuffix}-${sanitizedName}`);
    }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Validar tipo MIME y extensión
    const isValidMime = file.mimetype === 'application/pdf';
    const isValidExt = path.extname(file.originalname).toLowerCase() === '.pdf';
    
    if (!isValidMime || !isValidExt) {
        cb(new Error('Solo se permiten archivos PDF'));
        return;
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 1
    },
    fileFilter: fileFilter
}).single('archivo');

// Convertir el middleware de multer a una promesa
const uploadAsync = promisify(upload) as (req: Request, res: Response) => Promise<void>;

// Función para verificar si un archivo es un PDF válido
async function isPdfFile(filePath: string): Promise<boolean> {
    try {
        const buffer = await fs.promises.readFile(filePath);
        // Verificar la firma del archivo PDF
        return buffer.slice(0, 4).toString() === '%PDF';
    } catch (error) {
        return false;
    }
}

// Función para eliminar archivo
const deleteFile = (filePath: string): void => {
    try {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error('Error al eliminar archivo:', error);
    }
};

// Middleware principal para subida de PDFs con validaciones completas
export const uploadPdfWithValidation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Procesar la subida del archivo
        await uploadAsync(req, res);

        // Verificar si es requerido un archivo según el tipo de solicitud
        const isLicenciasMedicas = req.body.tipo === 'LICENCIA' || req.body.tipo === 'Licencia médica';
        
        if (isLicenciasMedicas && !req.file) {
            res.status(400).json({
                status: 'error',
                message: 'Se requiere adjuntar un archivo PDF para las licencias médicas'
            });
            return;
        }

        // Validación del contenido del archivo si existe
        if (req.file) {
            const isPdf = await isPdfFile(req.file.path);
            if (!isPdf) {
                deleteFile(req.file.path);
                res.status(400).json({
                    status: 'error',
                    message: 'El archivo no es un PDF válido'
                });
                return;
            }

            // Agregar información del archivo al request
            req.body.archivoInfo = {
                filename: req.file.filename,
                path: req.file.path,
                size: req.file.size,
                originalName: req.file.originalname
            };
        }

        next();
    } catch (error: unknown) {
        // Limpiar archivo en caso de error
        if (req.file?.path) {
            deleteFile(req.file.path);
        }

        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
                res.status(400).json({
                    status: 'error',
                    message: 'El archivo excede el límite de 10MB'
                });
                return;
            }
        }

        const errorMessage = error instanceof Error ? error.message : 'Error interno al procesar el archivo';
        res.status(500).json({
            status: 'error',
            message: errorMessage
        });
    }
};

// Middleware simplificado (mantener para compatibilidad)
export const uploadPdf = (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, async (err) => {
        try {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        status: 'error',
                        message: 'El archivo excede el límite de 10MB'
                    });
                }
                return res.status(400).json({
                    status: 'error',
                    message: 'Error al subir el archivo'
                });
            } else if (err) {
                return res.status(400).json({
                    status: 'error',
                    message: err.message
                });
            }

            // Validaciones específicas
            if (req.body.tipo === 'LICENCIA' && !req.file) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Se requiere adjuntar un archivo PDF para las licencias médicas'
                });
            }

            // Validar contenido del archivo
            if (req.file) {
                const isPdf = await isPdfFile(req.file.path);
                if (!isPdf) {
                    deleteFile(req.file.path);
                    return res.status(400).json({
                        status: 'error',
                        message: 'El archivo no es un PDF válido'
                    });
                }
            }

            next();
        } catch (error) {
            if (req.file?.path) {
                deleteFile(req.file.path);
            }
            res.status(500).json({
                status: 'error',
                message: 'Error interno al procesar el archivo'
            });
        }
    });
};

// Middleware de autenticación
export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({
            status: 'error',
            message: 'Usuario no autenticado'
        });
    }
    next();
};

// Middleware de permisos RRHH
export const checkRrhhPermissions = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || (req.user.role !== 'RecursosHumanos' && req.user.role !== 'SuperAdministrador')) {
        return res.status(403).json({
            status: 'error',
            message: 'No tiene permisos para realizar esta acción'
        });
    }
    next();
}; 