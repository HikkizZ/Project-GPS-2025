import { AppDataSource } from "../../config/configDB.js";
import { HistorialLaboral } from "../../entity/recursosHumanos/historialLaboral.entity.js";
import { Trabajador } from "../../entity/recursosHumanos/trabajador.entity.js";
import { LicenciaPermiso, TipoSolicitud, EstadoSolicitud } from "../../entity/recursosHumanos/licenciaPermiso.entity.js";
import { ServiceResponse } from "../../../types.js";

interface HistorialUnificado {
  id: string; // Formato: "tipo-id" (ej: "laboral-123", "trabajador-456")
  tipo: 'laboral' | 'trabajador' | 'usuario';
  fecha: Date;
  descripcion: string;
  detalles: any;
  registradoPor?: {
    id: number;
    name: string;
    role: string;
  } | null;
  trabajadorId: number;
}

export async function getHistorialLaboralByTrabajadorService(trabajadorId: number): Promise<ServiceResponse<HistorialLaboral[]>> {
    try {
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        const trabajador = await trabajadorRepo.findOne({
            where: { id: trabajadorId }
        });

        if (!trabajador) {
            return [null, "Trabajador no encontrado"];
        }

        const historialRepo = AppDataSource.getRepository(HistorialLaboral);
        const historial = await historialRepo.find({
            where: { trabajador: { id: trabajadorId } },
            relations: ["trabajador", "trabajador.usuario", "registradoPor"],
            order: { fechaInicio: "DESC" }
        });

        return [historial, null];
    } catch (error) {
        console.error("Error al obtener historial laboral:", error);
        return [null, "Error al obtener historial laboral"];
    }
}

export async function getHistorialUnificadoByTrabajadorService(trabajadorId: number): Promise<ServiceResponse<HistorialUnificado[]>> {
    try {
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        const trabajador = await trabajadorRepo.findOne({
            where: { id: trabajadorId },
            relations: ["usuario"]
        });

        if (!trabajador) {
            return [null, "Trabajador no encontrado"];
        }

        const historialUnificado: HistorialUnificado[] = [];

        // 1. Obtener historial laboral (cambios en ficha empresa, licencias, etc.)
        const historialRepo = AppDataSource.getRepository(HistorialLaboral);
        const historialLaboral = await historialRepo.find({
            where: { trabajador: { id: trabajadorId } },
            relations: ["trabajador", "trabajador.usuario", "registradoPor"],
            order: { createAt: "DESC" }
        });

        // 2. Obtener todas las licencias médicas aprobadas del trabajador para mapear archivos
        const licenciaRepo = AppDataSource.getRepository(LicenciaPermiso);
        const licenciasMedicas = await licenciaRepo.find({
            where: { 
                trabajador: { id: trabajadorId },
                tipo: TipoSolicitud.LICENCIA,
                estado: EstadoSolicitud.APROBADA
            }
        });

        // Crear un mapa de licencias por fechas para búsqueda rápida
        const licenciasPorFecha = new Map();
        licenciasMedicas.forEach(licencia => {
            const fechaInicioKey = licencia.fechaInicio.toISOString().split('T')[0];
            const fechaFinKey = licencia.fechaFin.toISOString().split('T')[0];
            const key = `${fechaInicioKey}-${fechaFinKey}`;
            licenciasPorFecha.set(key, licencia);
        });

        // Agregar registros de historial laboral
        historialLaboral.forEach(item => {
            let descripcion = '';
            let tipoRegistro = 'laboral';

            if (item.observaciones?.includes('Registro inicial')) {
                descripcion = 'Registro inicial del trabajador en el sistema';
            } else if (item.observaciones?.includes('Actualización de ficha')) {
                descripcion = 'Actualización de información laboral';
            } else if (item.observaciones?.includes('Licencia médica')) {
                descripcion = `Licencia médica aprobada (${item.fechaInicioLicenciaPermiso} - ${item.fechaFinLicenciaPermiso})`;
            } else if (item.observaciones?.includes('Permiso administrativo')) {
                descripcion = `Permiso administrativo aprobado (${item.fechaInicioLicenciaPermiso} - ${item.fechaFinLicenciaPermiso})`;
            } else if (item.observaciones?.includes('Desvinculación')) {
                descripcion = 'Desvinculación del trabajador';
            } else if (item.observaciones?.includes('Reactivación')) {
                descripcion = 'Reactivación del trabajador';
            } else if (item.observaciones?.includes('datos personales')) {
                descripcion = 'Actualización de datos personales';
                tipoRegistro = 'trabajador';
            } else if (item.observaciones?.includes('correo corporativo')) {
                descripcion = 'Cambio de correo corporativo';
                tipoRegistro = 'usuario';
            } else {
                descripcion = item.observaciones || 'Cambio en historial laboral';
            }

            // Buscar archivo de licencia médica si aplica
            let licenciaId = null;
            let archivoAdjuntoURL = null;
            if (item.observaciones?.includes('Licencia médica') && item.fechaInicioLicenciaPermiso && item.fechaFinLicenciaPermiso) {
                try {
                    // Convertir fechas a objetos Date si son strings
                    const fechaInicio = item.fechaInicioLicenciaPermiso instanceof Date 
                        ? item.fechaInicioLicenciaPermiso 
                        : new Date(item.fechaInicioLicenciaPermiso);
                    const fechaFin = item.fechaFinLicenciaPermiso instanceof Date 
                        ? item.fechaFinLicenciaPermiso 
                        : new Date(item.fechaFinLicenciaPermiso);
                    
                    // Validar que las fechas sean válidas
                    if (!isNaN(fechaInicio.getTime()) && !isNaN(fechaFin.getTime())) {
                        const fechaInicioKey = fechaInicio.toISOString().split('T')[0];
                        const fechaFinKey = fechaFin.toISOString().split('T')[0];
                        const key = `${fechaInicioKey}-${fechaFinKey}`;
                        const licenciaEncontrada = licenciasPorFecha.get(key);
                        if (licenciaEncontrada) {
                            licenciaId = licenciaEncontrada.id;
                            archivoAdjuntoURL = licenciaEncontrada.archivoAdjuntoURL;
                        }
                    }
                } catch (error) {
                    console.error('Error al procesar fechas de licencia:', error);
                }
            }

            historialUnificado.push({
                id: `laboral-${item.id}`,
                tipo: tipoRegistro as 'laboral' | 'trabajador' | 'usuario',
                fecha: item.createAt || new Date(),
                descripcion,
                detalles: {
                    historialLaboralId: item.id,
                    licenciaId: licenciaId,
                    archivoAdjuntoURL: archivoAdjuntoURL,
                    cargo: item.cargo,
                    area: item.area,
                    tipoContrato: item.tipoContrato,
                    jornadaLaboral: item.jornadaLaboral,
                    sueldoBase: item.sueldoBase,
                    estado: item.estado,
                    fechaInicioLicenciaPermiso: item.fechaInicioLicenciaPermiso,
                    fechaFinLicenciaPermiso: item.fechaFinLicenciaPermiso,
                    motivoLicenciaPermiso: item.motivoLicenciaPermiso,
                    motivoDesvinculacion: item.motivoDesvinculacion,
                    observaciones: item.observaciones,
                    contratoURL: item.contratoURL,
                    afp: item.afp,
                    previsionSalud: item.previsionSalud,
                    seguroCesantia: item.seguroCesantia
                },
                registradoPor: item.registradoPor ? {
                    id: item.registradoPor.id,
                    name: item.registradoPor.name,
                    role: item.registradoPor.role
                } : null,
                trabajadorId
            });
        });

        // 2. Agregar cambios específicos del trabajador (si tuviéramos un log de cambios)
        // Por ahora, agregar el registro de creación del trabajador
        historialUnificado.push({
            id: `trabajador-${trabajador.id}`,
            tipo: 'trabajador',
            fecha: trabajador.fechaIngreso || new Date(),
            descripcion: 'Ingreso al sistema como trabajador',
            detalles: {
                rut: trabajador.rut,
                nombres: trabajador.nombres,
                apellidoPaterno: trabajador.apellidoPaterno,
                apellidoMaterno: trabajador.apellidoMaterno,
                correoPersonal: trabajador.correoPersonal,
                fechaIngreso: trabajador.fechaIngreso
            },
            registradoPor: null,
            trabajadorId
        });

        // 3. Agregar cambios del usuario asociado
        if (trabajador.usuario) {
            historialUnificado.push({
                id: `usuario-${trabajador.usuario.id}`,
                tipo: 'usuario',
                fecha: trabajador.usuario.createAt || new Date(),
                descripcion: 'Creación de cuenta de usuario',
                detalles: {
                    usuarioId: trabajador.usuario.id,
                    corporateEmail: trabajador.usuario.corporateEmail,
                    role: trabajador.usuario.role,
                    estadoCuenta: trabajador.usuario.estadoCuenta
                },
                registradoPor: null,
                trabajadorId
            });
        }

        // Ordenar por fecha descendente (más reciente primero)
        historialUnificado.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

        return [historialUnificado, null];
    } catch (error) {
        console.error("Error al obtener historial unificado:", error);
        return [null, "Error al obtener historial unificado"];
    }
}

export async function getHistorialLaboralByIdService(id: number): Promise<ServiceResponse<HistorialLaboral>> {
    try {
        const historialRepo = AppDataSource.getRepository(HistorialLaboral);
        const historial = await historialRepo.findOne({
            where: { id },
            relations: ["trabajador", "registradoPor"]
        });

        if (!historial) {
            return [null, "Registro de historial laboral no encontrado."];
        }

        return [historial, null];
    } catch (error) {
        console.error("Error al obtener registro de historial laboral:", error);
        return [null, "Error interno del servidor."];
    }
}

/**
 * Servicio para descargar contrato del historial laboral
 */
export async function descargarContratoService(id: number): Promise<ServiceResponse<string>> {
    try {
        const historialRepo = AppDataSource.getRepository(HistorialLaboral);
        const historial = await historialRepo.findOne({
            where: { id },
            relations: ["trabajador"]
        });

        if (!historial) {
            return [null, "Registro de historial laboral no encontrado"];
        }

        if (!historial.contratoURL) {
            return [null, "No hay contrato disponible para este registro"];
        }

        return [historial.contratoURL, null];
    } catch (error) {
        console.error("Error al obtener contrato:", error);
        return [null, "Error interno del servidor"];
    }
}