import { Request, Response } from 'express';
import { FileManagementService } from '../services/fileManagement.service.js';
import { handleErrorClient, handleErrorServer } from '../handlers/responseHandlers.js';
import path from 'path';

/**
 * Controlador para descarga segura de archivos
 */
export async function downloadFile(req: Request, res: Response): Promise<void> {
    try {
        const { filePath } = req.params;
        
        if (!filePath) {
            handleErrorClient(res, 400, "Ruta del archivo no especificada");
            return;
        }

        // Validar que el usuario esté autenticado
        if (!req.user) {
            handleErrorClient(res, 401, "Usuario no autenticado");
            return;
        }

        // Obtener información del archivo
        const [fileInfo, error] = FileManagementService.getFileForDownload(`uploads/${filePath}`);
        
        if (error || !fileInfo) {
            const errorMessage = typeof error === 'string' ? error : error?.message || "Archivo no encontrado";
            handleErrorClient(res, 404, errorMessage);
            return;
        }

        if (!fileInfo.exists) {
            handleErrorClient(res, 404, "El archivo no existe en el servidor");
            return;
        }

        // Validar permisos según el tipo de archivo
        const isAuthorized = await validateFileAccess(req.user, filePath);
        if (!isAuthorized) {
            handleErrorClient(res, 403, "No tiene permisos para acceder a este archivo");
            return;
        }

        // Configurar headers para descarga
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.filename}"`);
        res.setHeader('Cache-Control', 'no-cache');

        // Enviar el archivo
        res.sendFile(path.resolve(fileInfo.filePath), (err) => {
            if (err) {
                console.error('Error al enviar archivo:', err);
                handleErrorServer(res, 500, "Error al descargar el archivo");
            }
        });

    } catch (error) {
        console.error("Error en downloadFile:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

/**
 * Valida si el usuario tiene acceso al archivo
 */
async function validateFileAccess(user: any, filePath: string): Promise<boolean> {
    try {
        // Administradores y RRHH tienen acceso a todos los archivos
        if (user.role === 'Administrador' || user.role === 'RecursosHumanos') {
            return true;
        }

        // Para usuarios normales, validar según el tipo de archivo
        if (filePath.includes('licencias/')) {
            // Para licencias, verificar que sea el usuario propietario
            return await validateLicenciaAccess(user, filePath);
        } else if (filePath.includes('contratos/') || filePath.includes('historial/')) {
            // Para contratos e historial, verificar que sea el trabajador propietario
            return await validateContratoHistorialAccess(user, filePath);
        } else if (filePath.includes('certificados/')) {
            // Para certificados, verificar que sea el trabajador propietario
            return await validateCertificadoAccess(user, filePath);
        }

        // Por defecto, denegar acceso
        return false;

    } catch (error) {
        console.error("Error al validar acceso a archivo:", error);
        return false;
    }
}

/**
 * Valida acceso a archivos de licencias
 */
async function validateLicenciaAccess(user: any, filePath: string): Promise<boolean> {
    // Implementar lógica específica para validar que el usuario
    // sea el propietario de la licencia
    // Por ahora, permitir acceso a usuarios autenticados
    return true;
}

/**
 * Valida acceso a archivos de contratos e historial
 */
async function validateContratoHistorialAccess(user: any, filePath: string): Promise<boolean> {
    // Implementar lógica específica para validar que el usuario
    // sea el propietario del contrato/historial
    // Por ahora, permitir acceso a usuarios autenticados
    return true;
}

/**
 * Valida acceso a archivos de certificados
 */
async function validateCertificadoAccess(user: any, filePath: string): Promise<boolean> {
    // Implementar lógica específica para validar que el usuario
    // sea el propietario del certificado
    // Por ahora, permitir acceso a usuarios autenticados
    return true;
} 