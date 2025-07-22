import { Request, Response } from "express";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js";
import { getHistorialLaboralByTrabajadorService, getHistorialUnificadoByTrabajadorService, descargarContratoService, descargarContratoHistorialService } from "../../services/recursosHumanos/historialLaboral.service.js";
import { User } from "../../entity/user.entity.js";
import { AppDataSource } from "../../config/configDB.js";
import { Trabajador } from "../../entity/recursosHumanos/trabajador.entity.js";

export async function getHistorialLaboral(req: Request, res: Response): Promise<void> {
    try {
        const user = req.user as User;
        let historial, errorMsg;

        // Solo permiten acceso estos roles
        const rolesPermitidos = ["SuperAdministrador", "Administrador", "RecursosHumanos"];
        if (!rolesPermitidos.includes(user.role)) {
            handleErrorClient(res, 403, "No tienes permisos para acceder al historial laboral");
            return;
        }

        // SuperAdministrador puede consultar cualquier historial, aunque no tenga trabajador asociado
        if (user.role === "SuperAdministrador") {
            const trabajadorId = parseInt(req.params.id);
            if (isNaN(trabajadorId)) {
                handleErrorClient(res, 400, "ID de trabajador inválido");
                return;
            }
            [historial, errorMsg] = await getHistorialLaboralByTrabajadorService(trabajadorId);
        } else {
            // Los demás roles permitidos (Administrador, RecursosHumanos) deben tener trabajador asociado
            const trabajadorRepo = AppDataSource.getRepository(Trabajador);
            const trabajador = user.rut ? await trabajadorRepo.findOne({
                where: { rut: user.rut }
            }) : null;

            if (!trabajador) {
                handleErrorClient(res, 400, "Trabajador no encontrado");
                return;
            }

            const trabajadorId = parseInt(req.params.id);
            if (isNaN(trabajadorId)) {
                handleErrorClient(res, 400, "ID de trabajador inválido");
                return;
            }
            [historial, errorMsg] = await getHistorialLaboralByTrabajadorService(trabajadorId);
        }

        if (errorMsg) {
            const errorMessage = typeof errorMsg === 'string' ? errorMsg : errorMsg.message;
            const statusCode = errorMessage.includes("no encontrado") ? 404 : 400;
            handleErrorClient(res, statusCode, errorMessage);
            return;
        }

        // Formatear la respuesta para filtrar los campos de registradoPor y filtrar trabajador (con usuario)
        const historialFiltrado = (historial || []).map((item: any) => {
            // Filtrar trabajador y su usuario
            let trabajadorFiltrado = null;
            if (item.trabajador) {
                trabajadorFiltrado = {
                    id: item.trabajador.id,
                    rut: item.trabajador.rut,
                    nombres: item.trabajador.nombres,
                    apellidoPaterno: item.trabajador.apellidoPaterno,
                    apellidoMaterno: item.trabajador.apellidoMaterno,
                    correoPersonal: item.trabajador.correoPersonal,
                    fechaIngreso: item.trabajador.fechaIngreso,
                    usuario: item.trabajador.usuario ? {
                        id: item.trabajador.usuario.id,
                        name: item.trabajador.usuario.name,
                        corporateEmail: item.trabajador.usuario.corporateEmail,
                        role: item.trabajador.usuario.role,
                        rut: item.trabajador.usuario.rut,
                        estadoCuenta: item.trabajador.usuario.estadoCuenta
                    } : null
                };
            }
            return {
                ...item,
                trabajador: trabajadorFiltrado,
                registradoPor: item.registradoPor ? {
                    id: item.registradoPor.id,
                    name: item.registradoPor.name,
                    corporateEmail: item.registradoPor.corporateEmail,
                    role: item.registradoPor.role,
                    rut: item.registradoPor.rut,
                    estadoCuenta: item.registradoPor.estadoCuenta
                } : null
            };
        });

        handleSuccess(res, 200, "Historial laboral obtenido exitosamente", historialFiltrado || []);
    } catch (error) {
        console.error("Error al obtener historial laboral:", error);
        handleErrorServer(res, 500, "Error al obtener historial laboral.");
    }
}

export async function descargarContrato(req: Request, res: Response): Promise<void> {
    try {
        const user = req.user as User;
        const rolesPermitidos = ["SuperAdministrador", "Administrador", "RecursosHumanos"];
        if (!rolesPermitidos.includes(user.role)) {
            handleErrorClient(res, 403, "No tienes permisos para descargar contratos");
            return;
        }

        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            handleErrorClient(res, 400, "ID inválido");
            return;
        }

        const [contratoURL, errorMsg] = await descargarContratoService(id);
        if (errorMsg) {
            handleErrorClient(res, 400, typeof errorMsg === 'string' ? errorMsg : errorMsg.message);
            return;
        }

        if (!contratoURL) {
            handleErrorClient(res, 404, "No se encontró el contrato");
            return;
        }

        handleSuccess(res, 200, "Contrato obtenido exitosamente", { contratoURL });
    } catch (error) {
        console.error("Error al descargar contrato:", error);
        handleErrorServer(res, 500, "Error al descargar contrato.");
    }
}

export async function getHistorialUnificado(req: Request, res: Response): Promise<void> {
    try {
        const user = req.user as User;
        let historial, errorMsg;

        // Solo permiten acceso estos roles
        const rolesPermitidos = ["SuperAdministrador", "Administrador", "RecursosHumanos"];
        if (!rolesPermitidos.includes(user.role)) {
            handleErrorClient(res, 403, "No tienes permisos para acceder al historial unificado");
            return;
        }

        // SuperAdministrador puede consultar cualquier historial, aunque no tenga trabajador asociado
        if (user.role === "SuperAdministrador") {
            const trabajadorId = parseInt(req.params.id);
            if (isNaN(trabajadorId)) {
                handleErrorClient(res, 400, "ID de trabajador inválido");
                return;
            }
            [historial, errorMsg] = await getHistorialUnificadoByTrabajadorService(trabajadorId);
        } else {
            // Los demás roles permitidos (Administrador, RecursosHumanos) deben tener trabajador asociado
            const trabajadorRepo = AppDataSource.getRepository(Trabajador);
            const trabajadorSolicitante = await trabajadorRepo.findOne({
                where: { usuario: { id: user.id } },
                relations: ["usuario"]
            });

            if (!trabajadorSolicitante) {
                handleErrorClient(res, 403, "Usuario sin trabajador asociado no puede acceder al historial");
                return;
            }

            const trabajadorId = parseInt(req.params.id);
            if (isNaN(trabajadorId)) {
                handleErrorClient(res, 400, "ID de trabajador inválido");
                return;
            }

            [historial, errorMsg] = await getHistorialUnificadoByTrabajadorService(trabajadorId);
        }

        if (errorMsg) {
            handleErrorClient(res, 400, typeof errorMsg === 'string' ? errorMsg : errorMsg.message || 'Error desconocido');
            return;
        }

        handleSuccess(res, 200, "Historial unificado obtenido exitosamente", historial || []);
    } catch (error) {
        console.error("Error al obtener historial unificado:", error);
        handleErrorServer(res, 500, "Error interno del servidor.");
    }
}

export async function descargarContratoHistorial(req: Request, res: Response): Promise<void> {
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

        const [resultado, error] = await descargarContratoHistorialService(id, req.user.id);

        if (error || !resultado) {
            const errorMessage = typeof error === 'string' ? error : error?.message || "Contrato no encontrado.";
            handleErrorClient(res, 404, errorMessage);
            return;
        }

        const { filePath, customFilename } = resultado;

        // Verificar que el archivo existe antes de intentar enviarlo
        const fs = await import('fs');
        if (!fs.existsSync(filePath)) {
            handleErrorClient(res, 404, "El archivo del contrato no se encuentra en el servidor");
            return;
        }

        // Validar nombre personalizado
        if (!customFilename || customFilename.trim() === '') {
            const fallbackName = `Contrato_Historial_${id}.pdf`;
            
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
        console.error("Error en el controlador descargarContratoHistorial:", error);
        handleErrorServer(res, 500, "Error interno del servidor.");
    }
}