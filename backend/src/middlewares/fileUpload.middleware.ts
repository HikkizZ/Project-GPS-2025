import { Request, Response, NextFunction } from 'express';
import { promisify } from 'util';
import multer from 'multer';
import { upload, isPdfFile, deleteFile } from '../config/fileUpload.config.js';

// Convertir el middleware de multer a una promesa
const uploadAsync = promisify(upload.single('archivo')) as (req: Request, res: Response) => Promise<void>;

/**
 * Middleware principal para subida de PDFs con validaciones completas
 */
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

/**
 * Middleware simplificado para compatibilidad
 */
export const uploadPdf = (req: Request, res: Response, next: NextFunction) => {
    upload.single('archivo')(req, res, async (err) => {
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