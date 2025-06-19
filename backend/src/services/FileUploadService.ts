import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { FileManagementService } from './fileManagement.service.js';

/**
 * Servicio para gestión de subida de archivos
 */
export class FileUploadService {
    private static readonly UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');

    /**
     * Crea los directorios necesarios para la subida de archivos
     */
    private static ensureDirectoryExists(dirPath: string): void {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 });
        }
    }

    /**
     * Configuración de almacenamiento con estructura de carpetas organizada
     */
    private static storage = multer.diskStorage({
        destination: (req, file, cb) => {
            // Determinar la carpeta según el tipo de archivo
            let uploadDir = FileUploadService.UPLOADS_DIR;
            
            if (req.baseUrl.includes('licencia-permiso')) {
                uploadDir = path.join(uploadDir, 'licencias');
            } else if (req.baseUrl.includes('ficha-empresa')) {
                uploadDir = path.join(uploadDir, 'contratos');
            } else if (req.baseUrl.includes('historial-laboral')) {
                uploadDir = path.join(uploadDir, 'historial');
            } else {
                uploadDir = path.join(uploadDir, 'general');
            }

            // Crear el directorio si no existe
            FileUploadService.ensureDirectoryExists(uploadDir);
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
            cb(null, `${uniqueSuffix}-${sanitizedName}`);
        }
    });

    /**
     * Filtro para solo permitir PDFs
     */
    private static fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        // Validar tipo MIME y extensión
        const isValidMime = file.mimetype === 'application/pdf';
        const isValidExt = path.extname(file.originalname).toLowerCase() === '.pdf';
        
        if (!isValidMime || !isValidExt) {
            cb(new Error('Solo se permiten archivos PDF'));
            return;
        }
        cb(null, true);
    };

    /**
     * Configuración de multer para subida de archivos
     */
    static readonly upload = multer({
        storage: FileUploadService.storage,
        fileFilter: FileUploadService.fileFilter,
        limits: {
            fileSize: 10 * 1024 * 1024, // 10MB máximo
            files: 1
        }
    });

    /**
     * Middleware para subida de archivos con validaciones
     */
    static uploadSingle(fieldName: string = 'archivo') {
        return FileUploadService.upload.single(fieldName);
    }

    /**
     * Middleware para subida de múltiples archivos
     */
    static uploadMultiple(fieldName: string = 'archivos', maxFiles: number = 5) {
        return multer({
            storage: FileUploadService.storage,
            fileFilter: FileUploadService.fileFilter,
            limits: {
                fileSize: 10 * 1024 * 1024, // 10MB máximo
                files: maxFiles
            }
        }).array(fieldName, maxFiles);
    }

    /**
     * Obtiene la ruta completa de un archivo de contrato
     */
    static getContratoPath(filename: string): string {
        return path.join(FileUploadService.UPLOADS_DIR, 'contratos', filename);
    }

    /**
     * Elimina un archivo de contrato específico
     */
    static deleteContratoFile(filename: string): boolean {
        try {
            const filePath = FileUploadService.getContratoPath(filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error al eliminar archivo de contrato:', error);
            return false;
        }
    }

    /**
     * Elimina un archivo usando FileManagementService (más robusto)
     */
    static deleteFile(fileUrl: string): boolean {
        const [success, error] = FileManagementService.deleteFile(fileUrl);
        if (error) {
            console.error('Error al eliminar archivo:', error);
            return false;
        }
        return success;
    }

    /**
     * Obtiene las rutas de los directorios de upload
     */
    static get PATHS() {
        return {
            UPLOADS_DIR: FileUploadService.UPLOADS_DIR,
            CONTRATOS_DIR: path.join(FileUploadService.UPLOADS_DIR, 'contratos'),
            LICENCIAS_DIR: path.join(FileUploadService.UPLOADS_DIR, 'licencias'),
            HISTORIAL_DIR: path.join(FileUploadService.UPLOADS_DIR, 'historial'),
            GENERAL_DIR: path.join(FileUploadService.UPLOADS_DIR, 'general')
        };
    }

    /**
     * Inicializa los directorios necesarios
     */
    static initialize(): void {
        FileManagementService.ensureUploadDirectories();
    }
} 