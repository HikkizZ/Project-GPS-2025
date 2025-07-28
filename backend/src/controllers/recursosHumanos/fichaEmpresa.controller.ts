import { Request, Response } from "express";
import { AppDataSource } from "../../config/configDB.js";
import { FichaEmpresa, EstadoLaboral } from "../../entity/recursosHumanos/fichaEmpresa.entity.js";
import { User } from "../../entity/user.entity.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js";
import { FichaEmpresaBodyValidation, FichaEmpresaUpdateValidation, EstadoFichaValidation } from "../../validations/recursosHumanos/fichaEmpresa.validation.js";
import { FileManagementService } from "../../services/fileManagement.service.js";
import { FileUploadService } from "../../services/fileUpload.service.js";
import {
    getFichasEmpresaService,
    getMiFichaService,
    updateFichaEmpresaService,
    descargarContratoService,
    deleteContratoService,
    assignBonoService,
    verificarEstadoAsignacionBonoService,
    getAsignacionesByFichaService,
    updateAsignarBonoService
} from "../../services/recursosHumanos/fichaEmpresa.service.js";
import { 
    AsignarBonoValidation,
    UpdateAsignarBonoValidation,
    AsignarBonoQueryValidation
} from "../../validations/recursosHumanos/remuneraciones/bono.validation.js";
import path from 'path';
import fs from 'fs';
import { AsignarBono } from "../../entity/recursosHumanos/Remuneraciones/asignarBono.entity.js";

export async function getFichasEmpresa(req: Request, res: Response) {
    try {
        const [fichas, error] = await getFichasEmpresaService(req.query);

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
        console.log('Archivo recibido en req.file:', req.file);
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
        const [ficha, error] = await updateFichaEmpresaService(id, validationResult.value, req.user, req.file);

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
        // Lógica corregida: simplemente pasar el archivo a updateFichaEmpresaService
        const [result, error] = await updateFichaEmpresaService(id, {}, req.user, req.file);
        if (error) {
            const errorMsg = typeof error === 'string' ? error : error?.message || "Error al subir contrato";
            handleErrorClient(res, 400, errorMsg);
            return;
        }
        if (!result) {
            handleErrorServer(res, 500, "Error inesperado al subir contrato");
            return;
        }
        handleSuccess(res, 200, "Contrato subido y actualizado exitosamente", result);
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
        const [result, error] = await deleteContratoService(id);
        if (error) {
            const errorMsg = typeof error === 'string' ? error : error?.message || "Error al eliminar contrato";
            handleErrorClient(res, 404, errorMsg);
            return;
        }
        if (!result) {
            handleErrorServer(res, 500, "Error inesperado al eliminar contrato");
            return;
        }
        handleSuccess(res, 200, "Contrato eliminado exitosamente", result);
    } catch (error) {
        console.error("Error en deleteContrato:", error);
        handleErrorServer(res, 500, "Error interno del servidor");
    }
}

export async function searchFichas(req: Request, res: Response): Promise<void> {
    try {
        const [fichas, error] = await getFichasEmpresaService(req.query);

        if (error) {
            const errorMessage = typeof error === 'string' ? error : error.message;
            res.status(404).json({
                status: "error",
                message: errorMessage
            });
            return;
        }

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

//Asignar bono
export async function asignarBono(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user?.id) {
            handleErrorClient(res, 401, "Usuario no autenticado");
            return;
        }
        // Validar que el usuario sea RRHH, Administrador o SuperAdministrador
        if (req.user.role !== 'RecursosHumanos' && req.user.role !== 'Administrador' && req.user.role !== 'SuperAdministrador') {
            handleErrorClient(res, 403, "No tiene permisos para asignar bonos");
            return;
        }

        // Preparar los datos de la solicitud
        const requestData = {
            ...req.body,
        };

        // Validar el cuerpo de la solicitud
        const validationResult = AsignarBonoValidation.validate(requestData, { abortEarly: false });
        if (validationResult.error) {
            
            handleErrorClient(res, 400, "Error de validación", {
                errors: validationResult.error.details.map(error => ({
                    field: error.path.join('.'),
                    message: error.message
                }))
            });
            return;
        }
              
        // Asignar el bono al trabajador
        const id = parseInt(req.params.idFicha);
        const [ asignacionBono, errorAsignacion ] = await assignBonoService( id, validationResult.value, req.user );
        if (errorAsignacion) {
            handleErrorClient(res, 400, errorAsignacion as string);
            return;
        }
        handleSuccess(res, 201, "Bono asignado exitosamente", asignacionBono || {});
    } catch (error) {
        console.error("Error al asignar bono:", error);
        handleErrorServer(res, 500, "Error interno del servidor al asignar bono");
    }   
}

//Actualizar estado asignación de bono
export async function updateAsignacionBono(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user?.id) {
            handleErrorClient(res, 401, "Usuario no autenticado");
            return;
        }
        // Validar que el usuario sea RRHH, Administrador o SuperAdministrador
        if (req.user.role !== 'RecursosHumanos' && req.user.role !== 'Administrador' && req.user.role !== 'SuperAdministrador') {
            handleErrorClient(res, 403, "No tiene permisos para actualizar asignaciones de bonos");
            return;
        }
        const idFicha = parseInt(req.params.idFicha);
        const asignacionId = parseInt(req.params.asignacionId);

        // Verificar si la asignación de bono existe
        const AsignarId = parseInt(req.params.asignacionId);
        if (isNaN(AsignarId)) {
            handleErrorClient(res, 400, "ID asignacion inválido");
            return;
        }
        // Preparar los datos de la solicitud
        const requestData = {
            ...req.body,
        };

        // Validar el cuerpo de la solicitud
        const validationResult = UpdateAsignarBonoValidation.validate(requestData, { abortEarly: false });
        if (validationResult.error) {
            handleErrorClient(res, 400, "Error de validación", {
                errors: validationResult.error.details.map(error => ({
                    field: error.path.join('.'),
                    message: error.message
                }))
            });
            return;
        }

        const asignacionBonoRepo = AppDataSource.getRepository(AsignarBono);
        const asignacionBono = await asignacionBonoRepo.findOne({
            where: { id: AsignarId },
            relations: ["fichaEmpresa", "bono"]
        });
        if (!asignacionBono) {
            handleErrorClient(res, 404, "Asignación de bono no encontrada");
            return;
        }
        // Verificar si la asignación de bono está activa
        const isActive = asignacionBono.activo;
        if (!isActive) {
            handleErrorClient(res, 400, "No se puede actualizar una asignación de bono inactiva");
            return;
        }
        const [updatedAsignacionBono, error] = await updateAsignarBonoService(AsignarId, idFicha, validationResult.value, req.user);
        if (error) {
            handleErrorClient(res, 400, error as string);
            return;
        }
        handleSuccess(res, 200, "Asignación de bono actualizada exitosamente", updatedAsignacionBono || {});
    } catch (error) {
        console.error("Error al actualizar asignación de bono:", error);
        handleErrorServer(res, 500, "Error interno del servidor al actualizar asignación de bono");
    }
}

// Verificar estado de asignación de bono
export async function verificarEstadoAsignacionBono(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user?.id) {
            handleErrorClient(res, 401, "Usuario no autenticado");
            return;
        }
        // Validar que el usuario sea RRHH, Administrador o SuperAdministrador
        if (req.user.role !== 'RecursosHumanos' && req.user.role !== 'Administrador' && req.user.role !== 'SuperAdministrador') {
            handleErrorClient(res, 403, "No tiene permisos para verificar estado de asignaciones de bonos");
            return;
        }
        
        const [estado, error] = await verificarEstadoAsignacionBonoService();
        if (error) {
            handleErrorServer(res, 500, typeof error === 'string' ? error : error.message);
            return;
        }
        if (!estado) {
            handleErrorClient(res, 404, "Error verificando estado de asignaciones de bonos");
            return;
        }
        const desactivadas = estado;
        const mensaje = `Procesamiento completado: ${desactivadas} licencias/permisos desactivadas`;
        handleSuccess(res, 200, mensaje, estado || {});
    } catch (error) {
        console.error("Error al verificar estado de asignación de bono:", error);
        handleErrorServer(res, 500, "Error interno del servidor al verificar estado de asignación de bono");
    }
}

// Obtener asignaciones de bonos por ficha de empresa
export async function getAsignacionesByFicha(req: Request, res: Response): Promise<void> {
    try {
        const idFicha = parseInt(req.params.idFicha);

        const [asignaciones, error] = await getAsignacionesByFichaService(idFicha);
        if (error) {
            handleErrorServer(res, 500, typeof error === 'string' ? error : error.message);
            return;
        }

        if (!asignaciones) {
            handleErrorClient(res, 404, "No se encontraron asignaciones de bonos");
            return;
        }

        handleSuccess(res, 200, "Asignaciones de bonos obtenidas exitosamente", asignaciones);
    } catch (error) {
        console.error("Error al obtener asignaciones de bonos por ficha de empresa:", error);
        handleErrorServer(res, 500, "Error interno del servidor al obtener asignaciones de bonos por ficha de empresa");
    }
}