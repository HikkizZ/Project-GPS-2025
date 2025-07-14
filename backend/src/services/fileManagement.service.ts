import fs from 'fs';
import path from 'path';
import { ServiceResponse } from '../../types.d.js';
import { fileURLToPath } from 'url';

// --- Definición de Rutas Centralizada ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, '..', '..');
const UPLOADS_DIR_ABSOLUTE = path.join(BACKEND_ROOT, 'uploads');

// --- Directorios Específicos ---
const DIRS_TO_ENSURE = [
    path.join(UPLOADS_DIR_ABSOLUTE, 'contratos'),
    path.join(UPLOADS_DIR_ABSOLUTE, 'licencias'),
    path.join(UPLOADS_DIR_ABSOLUTE, 'historial'),
];

export interface FileInfo {
    filename: string;
    path: string;
    size: number;
    originalName: string;
    url: string;
}

export interface DownloadFileInfo {
    filePath: string;
    filename: string;
    exists: boolean;
}

/**
 * Servicio para gestión de archivos
 */
export class FileManagementService {
    private static readonly BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
    private static readonly UPLOADS_DIR_RELATIVE = 'uploads';

    /**
     * Procesa la información del archivo subido
     */
    static processUploadedFile(file: Express.Multer.File): FileInfo {
        const relativePath = file.path.replace(/\\/g, '/');
        return {
            filename: file.filename,
            path: relativePath,
            size: file.size,
            originalName: file.originalname,
            url: `${this.BASE_URL}/api/files/${relativePath.replace('uploads/', '')}`
        };
    }

    /**
     * Obtiene información para descarga de archivo
     */
    static getFileForDownload(fileUrl: string): ServiceResponse<DownloadFileInfo> {
        try {
            if (!fileUrl) {
                return [null, "URL del archivo no proporcionada"];
            }

            // Extraer la ruta del archivo desde la URL
            let relativeFilePath: string;
            
            if (fileUrl.startsWith('http')) {
                // URL completa
                const urlParts = fileUrl.split('/api/files/');
                if (urlParts.length !== 2) {
                    return [null, "Formato de URL inválido"];
                }
                relativeFilePath = path.join(this.UPLOADS_DIR_RELATIVE, urlParts[1]);
            } else if (fileUrl.startsWith(this.UPLOADS_DIR_RELATIVE)) {
                // Ruta relativa
                relativeFilePath = fileUrl;
            } else {
                // Solo el nombre del archivo
                relativeFilePath = path.join(this.UPLOADS_DIR_RELATIVE, fileUrl);
            }

            // Normalizar la ruta y hacerla absoluta
            const absoluteFilePath = path.resolve(BACKEND_ROOT, relativeFilePath);

            // Verificar que el archivo existe
            const exists = fs.existsSync(absoluteFilePath);
            const filename = path.basename(absoluteFilePath);

            return [{
                filePath: absoluteFilePath,
                filename,
                exists
            }, null];

        } catch (error) {
            console.error("Error al procesar archivo para descarga:", error);
            return [null, "Error interno al procesar el archivo"];
        }
    }

    /**
     * Elimina un archivo del sistema
     */
    static deleteFile(filePath: string): ServiceResponse<boolean> {
        try {
            if (!fs.existsSync(filePath)) {
                return [false, "El archivo no existe"];
            }

            fs.unlinkSync(filePath);
            return [true, null];
        } catch (error) {
            console.error("Error al eliminar archivo:", error);
            return [false, "Error al eliminar el archivo"];
        }
    }

    /**
     * Valida que un archivo sea un PDF válido
     */
    static async validatePdfFile(filePath: string): Promise<ServiceResponse<boolean>> {
        try {
            if (!fs.existsSync(filePath)) {
                return [false, "Archivo no encontrado"];
            }

            const buffer = await fs.promises.readFile(filePath);
            const isPdf = buffer.slice(0, 4).toString() === '%PDF';
            
            return [isPdf, isPdf ? null : "El archivo no es un PDF válido"];

        } catch (error) {
            console.error("Error al validar archivo PDF:", error);
            return [false, "Error interno al validar el archivo"];
        }
    }

    /**
     * Crea los directorios necesarios para la subida de archivos
     */
    static ensureUploadDirectories(): void {
        DIRS_TO_ENSURE.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    /**
     * Obtiene el tamaño de un archivo en formato legible
     */
    static getFileSize(bytes: number): string {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Limpia archivos temporales o huérfanos
     */
    static async cleanupFiles(retentionDays: number = 30): Promise<ServiceResponse<number>> {
        try {
            let deletedCount = 0;
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

            const cleanDirectory = async (dirPath: string) => {
                if (!fs.existsSync(dirPath)) return;

                const files = await fs.promises.readdir(dirPath);
                
                for (const file of files) {
                    const filePath = path.join(dirPath, file);
                    const stats = await fs.promises.stat(filePath);
                    
                    if (stats.isFile() && stats.mtime < cutoffDate) {
                        await fs.promises.unlink(filePath);
                        deletedCount++;
                    }
                }
            };

            for (const dir of DIRS_TO_ENSURE) {
                await cleanDirectory(dir);
            }

            return [deletedCount, null];

        } catch (error) {
            console.error("Error al limpiar archivos:", error);
            return [0, "Error interno al limpiar archivos"];
        }
    }
} 