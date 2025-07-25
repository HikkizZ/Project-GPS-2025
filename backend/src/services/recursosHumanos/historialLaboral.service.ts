import { AppDataSource } from "../../config/configDB.js";
import { HistorialLaboral } from "../../entity/recursosHumanos/historialLaboral.entity.js";
import { Trabajador } from "../../entity/recursosHumanos/trabajador.entity.js";
import { User } from "../../entity/user.entity.js";
import { LicenciaPermiso, TipoSolicitud, EstadoSolicitud } from "../../entity/recursosHumanos/licenciaPermiso.entity.js";
import { FileUploadService } from "../fileUpload.service.js";
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
            } else if (item.observaciones?.includes('Subida de contrato PDF')) {
                descripcion = 'Subida de contrato PDF';
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
                    role: item.registradoPor.role,
                    rut: item.registradoPor.rut,
                    corporateEmail: item.registradoPor.corporateEmail
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

export async function descargarContratoHistorialService(
    id: number, 
    userId: number
): Promise<ServiceResponse<{filePath: string, customFilename: string}>> {
    try {
        const historialRepo = AppDataSource.getRepository(HistorialLaboral);
        const userRepo = AppDataSource.getRepository(User);

        const historial = await historialRepo.findOne({
            where: { id },
            relations: ["trabajador"]
        });

        if (!historial) {
            return [null, { message: "Registro de historial laboral no encontrado" }];
        }

        const user = await userRepo.findOne({
            where: { id: userId },
            relations: ["trabajador"]
        });

        if (!user) {
            return [null, { message: "Usuario no encontrado" }];
        }

        // Permitir acceso a RRHH, Admin, Superadmin o al dueño del historial
        const esRRHH = user.role === "RecursosHumanos";
        const esAdmin = user.role === "Administrador";
        const esSuperAdmin = user.role === "SuperAdministrador";
        const esDueno = user.trabajador?.id === historial.trabajador.id;

        const tienePrivilegios = esRRHH || esAdmin || esSuperAdmin || esDueno;

        if (!tienePrivilegios) {
            return [null, { message: "No tiene permiso para descargar este contrato" }];
        }

        if (!historial.contratoURL) {
            return [null, { message: "No hay contrato disponible para descargar en este registro" }];
        }

        // Usar el servicio de archivos para obtener la ruta absoluta y correcta
        const filePath = FileUploadService.getContratoPath(historial.contratoURL);

        // Verificar si el archivo existe
        if (!FileUploadService.fileExists(filePath)) {
            return [null, { message: "El archivo del contrato no se encuentra en el servidor." }];
        }

        // Generar nombre personalizado
        const trabajador = historial.trabajador;

        // Función para limpiar caracteres especiales y espacios
        const limpiarNombre = (nombre: string): string => {
            return nombre
                .replace(/[áàäâ]/g, 'a')
                .replace(/[éèëê]/g, 'e')
                .replace(/[íìïî]/g, 'i')
                .replace(/[óòöô]/g, 'o')
                .replace(/[úùüû]/g, 'u')
                .replace(/[ñ]/g, 'n')
                .replace(/[ç]/g, 'c')
                .replace(/[^a-zA-Z0-9]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '');
        };

        const nombresLimpios = limpiarNombre(trabajador.nombres || '');
        const apellidoPLimpio = limpiarNombre(trabajador.apellidoPaterno || '');
        const apellidoMLimpio = limpiarNombre(trabajador.apellidoMaterno || '');

        // Construir nombre personalizado
        let customFilename = '';
        if (nombresLimpios && apellidoPLimpio) {
            customFilename = `${nombresLimpios}_${apellidoPLimpio}`;
            if (apellidoMLimpio) {
                customFilename += `_${apellidoMLimpio}`;
            }
            customFilename += `-Contrato_Historial_${id}.pdf`;
        }

        // Validar que el nombre personalizado sea válido
        if (!customFilename || customFilename.length < 5 || !customFilename.includes('-Contrato_Historial_')) {
            customFilename = `Contrato_Historial_${id}.pdf`;
        }

        return [{ filePath, customFilename }, null];
    } catch (error) {
        console.error("Error en descargarContratoHistorialService:", error);
        return [null, { message: "Error interno del servidor" }];
    }
}