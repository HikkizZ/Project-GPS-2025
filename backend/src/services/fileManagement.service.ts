import fs from 'fs';
import path from 'path';
import { ServiceResponse } from '../../types.d.js';

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
    private static readonly UPLOADS_DIR = 'uploads';

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
            let filePath: string;
            
            if (fileUrl.startsWith('http')) {
                // URL completa
                const urlParts = fileUrl.split('/api/files/');
                if (urlParts.length !== 2) {
                    return [null, "Formato de URL inválido"];
                }
                filePath = path.join(this.UPLOADS_DIR, urlParts[1]);
            } else if (fileUrl.startsWith('uploads/')) {
                // Ruta relativa
                filePath = fileUrl;
            } else {
                // Solo el nombre del archivo
                filePath = path.join(this.UPLOADS_DIR, fileUrl);
            }

            // Normalizar la ruta
            filePath = path.normalize(filePath);

            // Verificar que el archivo existe
            const exists = fs.existsSync(filePath);
            const filename = path.basename(filePath);

            return [{
                filePath,
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
        const directories = [
            'uploads/licencias',
            'uploads/contratos', 
            'uploads/historial',
            'uploads/general'
        ];

        directories.forEach(dir => {
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
                        // Aquí podrías agregar lógica adicional para verificar
                        // si el archivo está referenciado en la base de datos
                        await fs.promises.unlink(filePath);
                        deletedCount++;
                    }
                }
            };

            await cleanDirectory('uploads/licencias');
            await cleanDirectory('uploads/contratos');
            await cleanDirectory('uploads/historial');
            await cleanDirectory('uploads/general');

            return [deletedCount, null];

        } catch (error) {
            console.error("Error al limpiar archivos:", error);
            return [0, "Error interno al limpiar archivos"];
        }
    }
} 