import { Request, Response } from "express";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js";
import { FichaEmpresaQueryValidation, FichaEmpresaBodyValidation } from "../../validations/recursosHumanos/fichaEmpresa.validation.js";
import { actualizarEstadoFichaService } from "../../services/recursosHumanos/fichaEmpresa.service.js";
import { AppDataSource } from "../../config/configDB.js";
import { FichaEmpresa, EstadoLaboral } from "../../entity/recursosHumanos/fichaEmpresa.entity.js";
import { ServiceResponse } from "../../../types.js";
import path from "path";
import fs from "fs";

export async function getFichaEmpresa(req: Request, res: Response): Promise<void> {
    try {
        // Si es la ruta /mi-ficha, usar el ID del usuario autenticado
        const query = req.path === '/mi-ficha' && req.user 
            ? { trabajadorId: req.user.id }
            : req.query;

        const validationResult = FichaEmpresaQueryValidation.validate(query, { abortEarly: false });
        if (validationResult.error) {
            handleErrorClient(res, 400, "Error de validación", {
                errors: validationResult.error.details.map(error => ({
                    field: error.path.join('.'),
                    message: error.message
                }))
            });
            return;
        }

        const fichaRepo = AppDataSource.getRepository(FichaEmpresa);
        const ficha = await fichaRepo.findOne({
            where: {
                ...(validationResult.value.id && { id: validationResult.value.id }),
                ...(validationResult.value.trabajadorId && { trabajador: { id: validationResult.value.trabajadorId } }),
                ...(validationResult.value.estado && { estado: validationResult.value.estado })
            },
            relations: ["trabajador"]
        });

        if (!ficha) {
            handleErrorClient(res, 404, "Ficha de empresa no encontrada");
            return;
        }

        // Verificar que el usuario solo pueda ver su propia ficha en la ruta /mi-ficha
        if (req.path === '/mi-ficha' && ficha.trabajador.id !== req.user?.id) {
            handleErrorClient(res, 403, "No tienes permiso para ver esta ficha");
            return;
        }

        handleSuccess(res, 200, "Ficha de empresa recuperada exitosamente", ficha);
    } catch (error) {
        console.error("Error al obtener ficha de empresa:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

export async function updateFichaEmpresa(req: Request, res: Response): Promise<void> {
    try {
        // Validar ID
        const idValidation = FichaEmpresaQueryValidation.validate({ id: req.params.id }, { abortEarly: false });
        if (idValidation.error) {
            handleErrorClient(res, 400, "Error de validación", {
                errors: idValidation.error.details.map(error => ({
                    field: error.path.join('.'),
                    message: error.message
                }))
            });
            return;
        }

        // Validar body
        const bodyValidation = FichaEmpresaBodyValidation.validate(req.body, { abortEarly: false });
        if (bodyValidation.error) {
            handleErrorClient(res, 400, "Error de validación", {
                errors: bodyValidation.error.details.map(error => ({
                    field: error.path.join('.'),
                    message: error.message
                }))
            });
            return;
        }

        const fichaRepo = AppDataSource.getRepository(FichaEmpresa);
        const ficha = await fichaRepo.findOne({
            where: { id: parseInt(req.params.id) },
            relations: ["trabajador"]
        });

        if (!ficha) {
            handleErrorClient(res, 404, "Ficha de empresa no encontrada");
            return;
        }

        // Actualizar campos
        Object.assign(ficha, bodyValidation.value);
        const fichaActualizada = await fichaRepo.save(ficha);

        handleSuccess(res, 200, "Ficha de empresa actualizada exitosamente", fichaActualizada);
    } catch (error) {
        console.error("Error al actualizar ficha de empresa:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

interface EstadoFichaBody {
    trabajadorId: number;
    estado: EstadoLaboral;
    fechaInicio: string;
    fechaFin?: string;
}

export async function actualizarEstadoFicha(req: Request, res: Response): Promise<void> {
    try {
        const { trabajadorId, estado, fechaInicio, fechaFin } = req.body as EstadoFichaBody;

        const [fichaActualizada, error] = await actualizarEstadoFichaService(
            trabajadorId,
            estado,
            new Date(fechaInicio),
            fechaFin ? new Date(fechaFin) : undefined
        );

        if (error) {
            handleErrorClient(res, 400, typeof error === 'string' ? error : error.message);
            return;
        }

        if (!fichaActualizada) {
            handleErrorClient(res, 404, "No se pudo actualizar el estado de la ficha");
            return;
        }

        handleSuccess(res, 200, "Estado de ficha actualizado exitosamente", fichaActualizada);
    } catch (error) {
        console.error("Error al actualizar estado de ficha:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

export async function descargarContrato(req: Request, res: Response): Promise<void> {
    try {
        const fichaRepo = AppDataSource.getRepository(FichaEmpresa);
        const ficha = await fichaRepo.findOne({
            where: { id: parseInt(req.params.id) },
            relations: ["trabajador"]
        });

        if (!ficha) {
            handleErrorClient(res, 404, "Ficha de empresa no encontrada");
            return;
        }

        if (!ficha.contratoURL) {
            handleErrorClient(res, 404, "No hay contrato asociado a esta ficha");
            return;
        }

        // Verificar que el usuario solo pueda ver su propio contrato o sea de RRHH
        if (req.user?.role !== "RecursosHumanos" && ficha.trabajador.id !== req.user?.id) {
            handleErrorClient(res, 403, "No tienes permiso para ver este contrato");
            return;
        }

        try {
            // Asumiendo que contratoURL es una ruta relativa al directorio de uploads
            const filePath = path.join(process.cwd(), "uploads", ficha.contratoURL);
            
            // Verificar si el archivo existe
            if (!fs.existsSync(filePath)) {
                handleErrorClient(res, 404, "Archivo no encontrado en el servidor");
                return;
            }

            // Configurar headers para la descarga
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="contrato_${ficha.trabajador.rut}.pdf"`);

            // Enviar el archivo
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        } catch (error) {
            console.error("Error al leer el archivo:", error);
            handleErrorServer(res, 500, "Error al descargar el archivo");
        }
    } catch (error) {
        console.error("Error al descargar contrato:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
} 