import { Request, Response } from "express";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js";
import { FichaEmpresaQueryValidation, FichaEmpresaBodyValidation } from "../../validations/recursosHumanos/fichaEmpresa.validation.js";
import { AppDataSource } from "../../config/configDB.js";
import { FichaEmpresa, EstadoLaboral } from "../../entity/recursosHumanos/fichaEmpresa.entity.js";
import { ServiceResponse } from "../../../types.js";
import {
    searchFichasEmpresa,
    getFichaEmpresaById,
    getMiFichaService,
    updateFichaEmpresaService,
    actualizarEstadoFichaService,
    descargarContratoService
} from "../../services/recursosHumanos/fichaEmpresa.service.js";
import { FichaEmpresaUpdateValidation, EstadoFichaValidation } from "../../validations/recursosHumanos/fichaEmpresa.validation.js";
import { getContratoPath, deleteContratoFile } from "../../config/fileUpload.config.js";
import path from 'path';
import fs from 'fs';

export async function getFichasEmpresa(req: Request, res: Response) {
    try {
        const [fichas, error] = await searchFichasEmpresa(req.query);

        if (error) {
            const errorMessage = typeof error === 'string' ? error : error.message;
            handleErrorClient(res, 404, errorMessage);
            return;
        }

        handleSuccess(res, 200, "Fichas de empresa recuperadas exitosamente", fichas!);
    } catch (error) {
        console.error("Error al obtener fichas de empresa:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

export async function getFichaEmpresa(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            handleErrorClient(res, 400, "ID inválido");
            return;
        }

        const [ficha, error] = await getFichaEmpresaById(id);

        if (error) {
            const errorMessage = typeof error === 'string' ? error : error.message;
            handleErrorClient(res, 404, errorMessage);
            return;
        }

        if (!ficha) {
            handleErrorClient(res, 404, "No se encontró la ficha del trabajador");
            return;
        }

        handleSuccess(res, 200, "", ficha);
    } catch (error) {
        console.error("Error al obtener ficha de empresa:", error);
        handleErrorServer(res, 500, "Error al procesar la solicitud");
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
        if (isNaN(id)) {
            handleErrorClient(res, 400, "ID inválido");
            return;
        }

        const validationResult = FichaEmpresaUpdateValidation.validate(req.body);
        if (validationResult.error) {
            handleErrorClient(res, 400, validationResult.error.message);
            return;
        }

        const [ficha, error] = await updateFichaEmpresaService(id, validationResult.value);

        if (error) {
            const errorMessage = typeof error === 'string' ? error : error.message;
            handleErrorClient(res, 404, errorMessage);
            return;
        }

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

export async function descargarContrato(req: Request, res: Response) {
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

        // Obtener ficha para verificar permisos y obtener ruta del archivo
        const fichaRepository = AppDataSource.getRepository(FichaEmpresa);
        const ficha = await fichaRepository.findOne({
            where: { id },
            relations: ['trabajador']
        });

        if (!ficha) {
            handleErrorClient(res, 404, "Ficha no encontrada");
            return;
        }

        // Verificar permisos (RRHH/Admin o el propio trabajador)
        const isRRHH = req.user.role === 'RecursosHumanos' || req.user.role === 'Administrador';
        const isOwnWorker = ficha.trabajador.id === req.user.id;

        if (!isRRHH && !isOwnWorker) {
            handleErrorClient(res, 403, "No tiene permisos para descargar este contrato");
            return;
        }

        if (!ficha.contratoURL) {
            handleErrorClient(res, 404, "No hay contrato disponible para esta ficha");
            return;
        }

        const filePath = getContratoPath(ficha.contratoURL);

        if (!fs.existsSync(filePath)) {
            handleErrorClient(res, 404, "Archivo de contrato no encontrado");
            return;
        }

        // Configurar headers para descarga
        const fileName = `contrato_${ficha.trabajador.nombres}_${ficha.trabajador.apellidoPaterno}.pdf`;
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/pdf');

        // Enviar archivo
        res.sendFile(path.resolve(filePath));

    } catch (error) {
        console.error("Error en descargarContrato:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

export async function uploadContrato(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            handleErrorClient(res, 400, "ID inválido");
            return;
        }

        if (!req.file) {
            handleErrorClient(res, 400, "No se ha subido ningún archivo");
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

        // Eliminar archivo anterior si existe
        if (ficha.contratoURL) {
            deleteContratoFile(ficha.contratoURL);
        }

        // Actualizar ficha con nuevo archivo
        ficha.contratoURL = req.file.filename;
        await fichaRepository.save(ficha);

        handleSuccess(res, 200, "Contrato subido exitosamente", {
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size
        });

    } catch (error) {
        console.error("Error en uploadContrato:", error);
        // Si hay error, eliminar archivo subido
        if (req.file) {
            deleteContratoFile(req.file.filename);
        }
        handleErrorServer(res, 500, "Error interno del servidor");
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
        const deleted = deleteContratoFile(ficha.contratoURL);
        
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