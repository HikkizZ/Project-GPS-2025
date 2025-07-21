import { Request, Response } from "express";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../../handlers/responseHandlers.js";
import { getHistorialLaboralByTrabajadorService, descargarContratoService } from "../../services/recursosHumanos/historialLaboral.service.js";
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