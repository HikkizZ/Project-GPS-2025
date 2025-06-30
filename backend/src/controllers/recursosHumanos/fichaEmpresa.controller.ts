import { Request, Response } from "express";
import { AppDataSource } from "../../config/configDB.js";
import { FichaEmpresa, EstadoLaboral } from "../../entity/recursosHumanos/fichaEmpresa.entity.js";
import { Trabajador } from "../../entity/recursosHumanos/trabajador.entity.js";
import { User } from "../../entity/user.entity.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js";
import { FichaEmpresaBodyValidation, FichaEmpresaUpdateValidation, EstadoFichaValidation } from "../../validations/recursosHumanos/fichaEmpresa.validation.js";
import { FileManagementService } from "../../services/fileManagement.service.js";
import { FileUploadService } from "../../services/fileUpload.service.js";
import {
    searchFichasEmpresa,
    getFichaEmpresaById,
    getMiFichaService,
    updateFichaEmpresaService,
    actualizarEstadoFichaService,
    descargarContratoService
} from "../../services/recursosHumanos/fichaEmpresa.service.js";
import path from 'path';
import fs from 'fs';

export async function getFichasEmpresa(req: Request, res: Response) {
    try {
        const [fichas, error] = await searchFichasEmpresa(req.query);

        if (error) {
            const errorMessage = typeof error === 'string' ? error : error.message;
            handleErrorClient(res, 400, errorMessage);
            return;
        }

        // Si no hay fichas, devolver array vacío con mensaje amigable
        const fichasData = fichas || [];
        const mensaje = fichasData.length === 0 
            ? "No hay fichas de empresa que coincidan con los criterios de búsqueda" 
            : "Fichas de empresa recuperadas exitosamente";

        handleSuccess(res, 200, mensaje, fichasData);
    } catch (error) {
        console.error("Error al obtener fichas de empresa:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

export async function getFichaEmpresa(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            handleErrorClient(res, 400, "El ID proporcionado no es válido");
            return;
        }

        const [ficha, error] = await getFichaEmpresaById(id);

        if (error) {
            const errorMessage = typeof error === 'string' ? error : error.message;
            handleErrorClient(res, 404, errorMessage);
            return;
        }

        if (!ficha) {
            handleErrorClient(res, 404, "La ficha solicitada no existe o fue eliminada");
            return;
        }

        handleSuccess(res, 200, "Ficha encontrada exitosamente", ficha);
    } catch (error) {
        console.error("Error al obtener ficha de empresa:", error);
        handleErrorServer(res, 500, "Error interno al procesar la solicitud");
    }
}

export async function getMiFicha(req: Request, res: Response) {
    try {
        if (!req.user?.id) {
            handleErrorClient(res, 401, "Usuario no autenticado");
            return;
        }

        const [ficha, error] = await getMiFichaService(req.user.id);

        if (error) {
            const errorMessage = typeof error === 'string' ? error : error.message;
            handleErrorClient(res, 404, errorMessage);
            return;
        }

        handleSuccess(res, 200, "Ficha recuperada exitosamente", ficha!);
    } catch (error) {
        console.error("Error al obtener mi ficha:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

export async function updateFichaEmpresa(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        console.log('Intentando actualizar ficha con ID:', id);
        
        if (isNaN(id)) {
            console.log('ID inválido:', req.params.id);
            handleErrorClient(res, 400, "ID inválido");
            return;
        }

        const validationResult = FichaEmpresaUpdateValidation.validate(req.body);
        if (validationResult.error) {
            console.log('Error de validación:', validationResult.error.message);
            handleErrorClient(res, 400, validationResult.error.message);
            return;
        }

        console.log('Datos a actualizar:', validationResult.value);
        const [ficha, error] = await updateFichaEmpresaService(id, validationResult.value);

        if (error) {
            console.log('Error al actualizar:', error);
            const errorMessage = typeof error === 'string' ? error : error.message;
            handleErrorClient(res, 404, errorMessage);
            return;
        }

        console.log('Ficha actualizada exitosamente:', ficha);
        handleSuccess(res, 200, "Ficha actualizada exitosamente", ficha!);
    } catch (error) {
        console.error("Error en updateFichaEmpresa:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

export async function actualizarEstadoFicha(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            handleErrorClient(res, 400, "ID inválido");
            return;
        }

        if (!req.user?.id) {
            handleErrorClient(res, 401, "Usuario no autenticado");
            return;
        }

        const validationResult = EstadoFichaValidation.validate(req.body);
        if (validationResult.error) {
            handleErrorClient(res, 400, validationResult.error.message);
            return;
        }

        const { estado, fechaInicio, fechaFin, motivo } = validationResult.value;

        const [ficha, error] = await actualizarEstadoFichaService(
            id,
            estado,
            fechaInicio,
            fechaFin,
            motivo,
            req.user.id
        );

        if (error) {
            const errorMessage = typeof error === 'string' ? error : error.message;
            if (errorMessage.includes("No tiene permiso")) {
                handleErrorClient(res, 403, errorMessage);
                return;
            }
            if (errorMessage.includes("Ficha no encontrada")) {
                handleErrorClient(res, 404, errorMessage);
                return;
            }
            // Por defecto, cualquier otro error es un error de validación
            handleErrorClient(res, 400, errorMessage);
            return;
        }

        handleSuccess(res, 200, "Estado de ficha actualizado exitosamente", ficha!);
    } catch (error) {
        console.error("Error en actualizarEstadoFicha:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

export async function descargarContrato(req: Request, res: Response): Promise<void> {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            handleErrorClient(res, 400, "ID inválido");
            return;
        }

        if (!req.user?.id) {
            handleErrorClient(res, 401, "Usuario no autenticado");
            return;
        }

        const [resultado, error] = await descargarContratoService(id, req.user.id);

        if (error || !resultado) {
            const errorMessage = typeof error === 'string' ? error : "Contrato no encontrado.";
            handleErrorClient(res, 404, errorMessage);
            return;
        }

        const { filePath, customFilename } = resultado;

        // Verificar que el archivo existe antes de intentar enviarlo
        if (!fs.existsSync(filePath)) {
            handleErrorClient(res, 404, "El archivo del contrato no se encuentra en el servidor");
            return;
        }

        // Validar nombre personalizado
        if (!customFilename || customFilename.trim() === '') {
            const fallbackName = `Contrato_${id}.pdf`;
            
            // Configurar headers para evitar cache y forzar descarga ANTES de res.download
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${fallbackName}"`);
            res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
            
            res.download(filePath, fallbackName, (err) => {
                if (err && !res.headersSent) {
                    handleErrorServer(res, 500, "No se pudo descargar el archivo.");
                }
            });
            return;
        }

        // Configurar headers para evitar cache y forzar descarga ANTES de res.download
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${customFilename}"`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

        // Enviar archivo con nombre personalizado
        res.download(filePath, customFilename, (err) => {
            if (err && !res.headersSent) {
                handleErrorServer(res, 500, "No se pudo descargar el archivo.");
            }
        });

    } catch (error) {
        console.error("Error en el controlador descargarContrato:", error);
        handleErrorServer(res, 500, "Error interno del servidor.");
    }
}

export async function uploadContrato(req: Request, res: Response): Promise<void> {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            handleErrorClient(res, 400, "ID inválido");
            return;
        }

        if (!req.file) {
            handleErrorClient(res, 400, "No se ha subido ningún archivo.");
            return;
        }

        const fichaRepository = AppDataSource.getRepository(FichaEmpresa);
        const ficha = await fichaRepository.findOneBy({ id });

        if (!ficha) {
            FileUploadService.deleteFile(req.file.path);
            handleErrorClient(res, 404, "Ficha no encontrada.");
            return;
        }

        const nuevoContratoFilename = req.file.filename;

        if (ficha.contratoURL) {
            const oldFilePath = FileUploadService.getContratoPath(ficha.contratoURL);
            FileUploadService.deleteFile(oldFilePath);
        }

        ficha.contratoURL = nuevoContratoFilename;
        await fichaRepository.save(ficha);

        handleSuccess(res, 200, "Contrato subido y actualizado exitosamente", {
            contratoUrl: nuevoContratoFilename
        });

    } catch (error) {
        console.error("Error al subir contrato:", error);
        if (req.file) {
            FileUploadService.deleteFile(req.file.path);
        }
        handleErrorServer(res, 500, "Error interno al procesar la subida del archivo.");
    }
}

export async function deleteContrato(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            handleErrorClient(res, 400, "ID inválido");
            return;
        }

        // Obtener ficha
        const fichaRepository = AppDataSource.getRepository(FichaEmpresa);
        const ficha = await fichaRepository.findOne({
            where: { id },
            relations: ['trabajador']
        });

        if (!ficha) {
            handleErrorClient(res, 404, "Ficha no encontrada");
            return;
        }

        if (!ficha.contratoURL) {
            handleErrorClient(res, 404, "No hay contrato para eliminar");
            return;
        }

        // Eliminar archivo físico
        const deleted = FileUploadService.deleteContratoFile(ficha.contratoURL);
        
        // Actualizar ficha
        ficha.contratoURL = null;
        await fichaRepository.save(ficha);

        handleSuccess(res, 200, "Contrato eliminado exitosamente", {
            deleted: deleted
        });

    } catch (error) {
        console.error("Error en deleteContrato:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

export async function searchFichas(req: Request, res: Response): Promise<void> {
    try {
        console.log("🔍 Recibiendo petición de búsqueda");
        console.log("📝 Query params recibidos:", req.query);

        const [fichas, error] = await searchFichasEmpresa(req.query);

        if (error) {
            console.log("❌ Error en la búsqueda:", error);
            const errorMessage = typeof error === 'string' ? error : error.message;
            res.status(404).json({
                status: "error",
                message: errorMessage
            });
            return;
        }

        console.log("✅ Búsqueda exitosa, enviando respuesta");
        res.status(200).json({
            status: "success",
            data: fichas
        });
    } catch (error) {
        console.error("❌ Error en el controlador searchFichas:", error);
        res.status(500).json({
            status: "error",
            message: "Error interno del servidor"
        });
    }
} 