import { AppDataSource } from "../../config/configDB.js";
import { FichaEmpresa, EstadoLaboral } from "../../entity/recursosHumanos/fichaEmpresa.entity.js";
import { ServiceResponse } from "../../../types.js";
import { FindOptionsWhere, ILike, LessThanOrEqual, MoreThanOrEqual, Between, In } from "typeorm";
import { Trabajador } from "../../entity/recursosHumanos/trabajador.entity.js";
import { User } from "../../entity/user.entity.js";
import { LicenciaPermiso, TipoSolicitud, EstadoSolicitud } from "../../entity/recursosHumanos/licenciaPermiso.entity.js";
import { normalizeText } from "../../helpers/normalizeText.helper.js";
import { FileUploadService } from "../../services/fileUpload.service.js";
import path from 'path';

// Interfaz para los parámetros de búsqueda
interface SearchFichaParams {
    // Búsqueda por trabajador
    trabajadorId?: number;
    rut?: string;

    // Búsqueda por estado
    estado?: EstadoLaboral;
    estados?: EstadoLaboral[];

    // Búsqueda por información laboral
    cargo?: string;
    area?: string;
    tipoContrato?: string;
    jornadaLaboral?: string;

    // Búsqueda por rango salarial
    sueldoBaseDesde?: number;
    sueldoBaseHasta?: number;

    // Búsqueda por fechas
    fechaInicioDesde?: Date;
    fechaInicioHasta?: Date;
    fechaFinDesde?: Date;
    fechaFinHasta?: Date;
    incluirSinFechaFin?: boolean;
}

export async function searchFichasEmpresa(params: SearchFichaParams): Promise<ServiceResponse<FichaEmpresa[]>> {
    try {
        const fichaRepo = AppDataSource.getRepository(FichaEmpresa);
        const queryBuilder = fichaRepo.createQueryBuilder("ficha")
            .leftJoinAndSelect("ficha.trabajador", "trabajador")
            .leftJoinAndSelect("trabajador.usuario", "usuario");

        // Filtros por trabajador
        if (params.rut) {
            // Limpiar el RUT de búsqueda (quitar puntos y guión)
            const cleanRut = params.rut.replace(/\./g, '').replace(/-/g, '');
            
            // Buscar tanto el RUT limpio como el RUT con formato
            queryBuilder.andWhere(
                "REPLACE(REPLACE(trabajador.rut, '.', ''), '-', '') ILIKE :cleanRut",
                { cleanRut: `%${cleanRut}%` }
            );
        }

        if (params.trabajadorId) {
            queryBuilder.andWhere("trabajador.id = :trabajadorId", { trabajadorId: params.trabajadorId });
        }

        // Filtro por estado
        if (params.estado) {
            queryBuilder.andWhere("ficha.estado = :estado", { estado: params.estado });
        } else if (params.estados && params.estados.length > 0) {
            queryBuilder.andWhere("ficha.estado IN (:...estados)", { estados: params.estados });
        }

        // Filtros por información laboral (búsqueda parcial)
        if (params.cargo) {
            const cargoTrimmed = params.cargo.trim().toLowerCase();
            // Manejar el caso especial de "sin cargo"/"sin cárgo"
            if (cargoTrimmed === 'sin cargo' || cargoTrimmed === 'sin cárgo') {
                queryBuilder.andWhere("LOWER(ficha.cargo) SIMILAR TO :cargoPattern", {
                    cargoPattern: '%(sin cargo|sin cárgo)%'
                });
            } else {
                queryBuilder.andWhere("LOWER(ficha.cargo) ILIKE LOWER(:cargo)", { cargo: `%${cargoTrimmed}%` });
            }
        }
        if (params.area) {
            const areaTrimmed = params.area.trim().toLowerCase();
            // Manejar el caso especial de "sin area"/"sin área"
            if (areaTrimmed === 'sin area' || areaTrimmed === 'sin área') {
                queryBuilder.andWhere("LOWER(ficha.area) SIMILAR TO :areaPattern", { 
                    areaPattern: '%(sin area|sin área)%' 
                });
            } else {
                queryBuilder.andWhere("LOWER(ficha.area) ILIKE LOWER(:area)", { area: `%${areaTrimmed}%` });
            }
        }
        if (params.tipoContrato) {
            queryBuilder.andWhere("ficha.tipoContrato = :tipoContrato", { tipoContrato: params.tipoContrato });
        }
        if (params.jornadaLaboral) {
            queryBuilder.andWhere("ficha.jornadaLaboral = :jornadaLaboral", { jornadaLaboral: params.jornadaLaboral });
        }

        // Filtro por rango salarial
        if (params.sueldoBaseDesde || params.sueldoBaseHasta) {
            if (params.sueldoBaseDesde) {
                queryBuilder.andWhere("ficha.sueldoBase >= :sueldoBaseDesde", { sueldoBaseDesde: params.sueldoBaseDesde });
            }
            if (params.sueldoBaseHasta) {
                queryBuilder.andWhere("ficha.sueldoBase <= :sueldoBaseHasta", { sueldoBaseHasta: params.sueldoBaseHasta });
            }
        }

        // Filtros por fechas
        if (params.fechaInicioDesde || params.fechaInicioHasta) {
            if (params.fechaInicioDesde) {
                queryBuilder.andWhere("ficha.fechaInicioContrato >= :fechaInicioDesde", 
                    { fechaInicioDesde: params.fechaInicioDesde });
            }
            if (params.fechaInicioHasta) {
                queryBuilder.andWhere("ficha.fechaInicioContrato <= :fechaInicioHasta", 
                    { fechaInicioHasta: params.fechaInicioHasta });
            }
        }

        if (params.fechaFinDesde || params.fechaFinHasta) {
            if (params.incluirSinFechaFin) {
                // Si se incluyen fichas sin fecha fin, usar OR para incluir NULL
                const fechaFinConditions = [];
                const fechaFinParams: any = {};
                
                if (params.fechaFinDesde) {
                    fechaFinConditions.push("ficha.fechaFinContrato >= :fechaFinDesde");
                    fechaFinParams.fechaFinDesde = params.fechaFinDesde;
                }
                if (params.fechaFinHasta) {
                    fechaFinConditions.push("ficha.fechaFinContrato <= :fechaFinHasta");
                    fechaFinParams.fechaFinHasta = params.fechaFinHasta;
                }
                
                if (fechaFinConditions.length > 0) {
                    const condition = `(${fechaFinConditions.join(' AND ')} OR ficha.fechaFinContrato IS NULL)`;
                    queryBuilder.andWhere(condition, fechaFinParams);
                }
            } else {
                // Comportamiento original: solo fichas con fecha fin
                if (params.fechaFinDesde) {
                    queryBuilder.andWhere("ficha.fechaFinContrato >= :fechaFinDesde", 
                        { fechaFinDesde: params.fechaFinDesde });
                }
                if (params.fechaFinHasta) {
                    queryBuilder.andWhere("ficha.fechaFinContrato <= :fechaFinHasta", 
                        { fechaFinHasta: params.fechaFinHasta });
                }
            }
        }

        // Ordenar por ID
        queryBuilder.orderBy("ficha.id", "ASC");

        const fichas = await queryBuilder.getMany();

        if (!fichas.length) {
            return [null, { message: "No hay fichas de empresa que coincidan con los criterios de búsqueda" }];
        }

        return [fichas, null];
    } catch (error) {
        console.error("Error al buscar fichas de empresa:", error);
        return [null, { message: "Error interno del servidor" }];
    }
}

export async function getFichaEmpresaById(id: number): Promise<ServiceResponse<FichaEmpresa>> {
    try {
        const fichaRepo = AppDataSource.getRepository(FichaEmpresa);
        const ficha = await fichaRepo.findOne({
            where: { id },
            relations: ["trabajador", "trabajador.usuario"]
        });

        if (!ficha) {
            return [null, { message: "Ficha no encontrada" }];
        }

        if (ficha.trabajador && ficha.trabajador.rut === "11.111.111-1") {
            return [null, { message: "No se puede modificar ni eliminar la ficha del superadministrador." }];
        }

        return [ficha, null];
    } catch (error) {
        console.error("Error en getFichaEmpresaById:", error);
        return [null, { message: "Error interno del servidor" }];
    }
}

export async function getMiFichaService(userId: number): Promise<ServiceResponse<FichaEmpresa>> {
    try {
        const userRepo = AppDataSource.getRepository(User);
        const fichaRepo = AppDataSource.getRepository(FichaEmpresa);

        const user = await userRepo.findOne({
            where: { id: userId },
            relations: ["trabajador"]
        });

        if (!user || !user.trabajador) {
            return [null, { message: "Usuario no encontrado o no tiene ficha asociada" }];
        }

        const ficha = await fichaRepo.findOne({
            where: { trabajador: { id: user.trabajador.id } },
            relations: ["trabajador", "trabajador.usuario"]
        });

        if (!ficha) {
            return [null, { message: "Ficha no encontrada" }];
        }

        if (ficha.trabajador && ficha.trabajador.rut === "11.111.111-1") {
            return [null, { message: "No se puede modificar ni eliminar la ficha del superadministrador." }];
        }

        return [ficha, null];
    } catch (error) {
        console.error("Error en getMiFichaService:", error);
        return [null, { message: "Error interno del servidor" }];
    }
}

export async function actualizarEstadoFichaService(
    id: number, 
    estado: EstadoLaboral,
    fechaInicio?: Date | string,
    fechaFin?: Date | string,
    motivo?: string,
    userId?: number
): Promise<ServiceResponse<FichaEmpresa>> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        // Convertir fechas de string a Date si es necesario
        const fechaInicioDate = fechaInicio ? new Date(fechaInicio) : undefined;
        const fechaFinDate = fechaFin ? new Date(fechaFin) : undefined;

        // Primero verificamos si la ficha existe
        const fichaRepo = queryRunner.manager.getRepository(FichaEmpresa);
        const ficha = await fichaRepo.findOne({
            where: { id },
            relations: ["trabajador", "trabajador.usuario"]
        });

        if (!ficha) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return [null, { message: "Ficha no encontrada" }];
        }

        if (ficha.trabajador && ficha.trabajador.rut === "11.111.111-1") {
            return [null, { message: "No se puede modificar ni eliminar la ficha del superadministrador." }];
        }

        // Verificar permisos del usuario
        if (userId) {
            const userRepo = queryRunner.manager.getRepository(User);
            const user = await userRepo.findOne({ where: { id: userId } });
            if (!user || (user.role !== "RecursosHumanos" && user.role !== "Administrador")) {
                throw new Error('No tienes permisos para realizar esta acción');
            }
        }

        // Validar que si es desvinculación, se proporcione un motivo
        if (estado === EstadoLaboral.DESVINCULADO) {
            if (!motivo) {
                await queryRunner.rollbackTransaction();
                await queryRunner.release();
                return [null, { message: "El motivo es requerido para la desvinculación" }];
            }
            ficha.fechaFinContrato = new Date();
            ficha.motivoDesvinculacion = motivo;
        }

        console.log(`🔄 actualizarEstadoFichaService - Actualizando ficha ID ${id} a estado: ${estado}`);
        console.log(`📅 Fechas recibidas - Inicio: ${fechaInicio}, Fin: ${fechaFin}`);
        console.log(`📝 Motivo: ${motivo}`);

        // Actualizar el estado y otros campos
        ficha.estado = estado;

        // Para licencias y permisos, guardar las fechas
        if (estado === EstadoLaboral.LICENCIA || estado === EstadoLaboral.PERMISO) {
            console.log(`📋 Procesando estado ${estado} - Guardando fechas de licencia`);
            if (fechaInicioDate) {
                ficha.fechaInicioLicencia = fechaInicioDate;
                console.log(`✅ Fecha inicio licencia guardada: ${fechaInicioDate}`);
            }
            if (fechaFinDate) {
                ficha.fechaFinLicencia = fechaFinDate;
                console.log(`✅ Fecha fin licencia guardada: ${fechaFinDate}`);
            }
            if (motivo) {
                ficha.motivoLicencia = motivo;
                console.log(`✅ Motivo licencia guardado: ${motivo}`);
            }
        }

        // Si vuelve a estado ACTIVO, limpiar fechas de licencia
        if (estado === EstadoLaboral.ACTIVO) {
            console.log(`🔄 Volviendo a estado ACTIVO - Limpiando fechas de licencia`);
            ficha.fechaInicioLicencia = null;
            ficha.fechaFinLicencia = null;
            ficha.motivoLicencia = null;
        }

        // Guardar los cambios
        const fichaActualizada = await fichaRepo.save(ficha);

        // Confirmar la transacción
        await queryRunner.commitTransaction();
        await queryRunner.release();

        return [fichaActualizada, null];
    } catch (error) {
        // Revertir en caso de error
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        console.error("Error en actualizarEstadoFichaService:", error);
        return [null, { message: "Error interno del servidor" }];
    }
}

// Definir los campos que no se pueden modificar según el estado
const CAMPOS_PROTEGIDOS = ['id', 'trabajador'] as const;
const CAMPOS_ESTADO_DESVINCULADO = ['cargo', 'area', 'tipoContrato', 'jornadaLaboral', 'sueldoBase'] as const;

export async function updateFichaEmpresaService(
    id: number, 
    fichaData: Partial<FichaEmpresa>
): Promise<ServiceResponse<FichaEmpresa>> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const fichaRepo = queryRunner.manager.getRepository(FichaEmpresa);
        
        // 1. Obtener la ficha actual con sus relaciones
        const fichaActual = await fichaRepo.findOne({
            where: { id },
            relations: ["trabajador", "trabajador.usuario"]
        });

        if (!fichaActual) {
            return [null, { message: "Ficha no encontrada" }];
        }

        if (fichaActual.trabajador && fichaActual.trabajador.rut === "11.111.111-1") {
            return [null, { message: "No se puede modificar ni eliminar la ficha del superadministrador." }];
        }

        // 2. Validar campos protegidos
        const camposInvalidos = CAMPOS_PROTEGIDOS.filter(campo => campo in fichaData);
        if (camposInvalidos.length > 0) {
            return [null, { message: `No se pueden modificar los siguientes campos: ${camposInvalidos.join(', ')}` }];
        }

        // 3. Validar según el estado actual
        if (fichaActual.estado === EstadoLaboral.DESVINCULADO) {
            const intentaModificar = CAMPOS_ESTADO_DESVINCULADO.filter(campo => campo in fichaData);
            if (intentaModificar.length > 0) {
                return [null, { message: "No se pueden modificar datos laborales de una ficha desvinculada" }];
            }
        }

        // 4. Validar cambios específicos
        if ('sueldoBase' in fichaData && fichaData.sueldoBase !== undefined) {
            if (fichaData.sueldoBase <= 0) {
                return [null, { message: "El sueldo base debe ser mayor a 0" }];
            }
        }

        if ('fechaFinContrato' in fichaData && fichaData.fechaFinContrato) {
            const fechaFin = new Date(fichaData.fechaFinContrato);
            if (fechaFin <= fichaActual.fechaInicioContrato) {
                return [null, { message: "La fecha de fin de contrato debe ser posterior a la fecha de inicio" }];
            }
        }

        if ('tipoContrato' in fichaData && fichaData.tipoContrato) {
            const tiposValidos = ["Indefinido", "Plazo Fijo", "Por Obra", "Part-Time"];
            if (!tiposValidos.includes(fichaData.tipoContrato)) {
                return [null, { message: "Tipo de contrato no válido" }];
            }
        }

        if ('jornadaLaboral' in fichaData && fichaData.jornadaLaboral) {
            const jornadasValidas = ["Completa", "Media", "Part-Time"];
            if (!jornadasValidas.includes(fichaData.jornadaLaboral)) {
                return [null, { message: "Jornada laboral no válida" }];
            }
        }

        // 5. Aplicar los cambios validados
        Object.assign(fichaActual, fichaData);

        // 6. Guardar los cambios
        const fichaActualizada = await fichaRepo.save(fichaActual);
        await queryRunner.commitTransaction();

        return [fichaActualizada, null];
    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("Error en updateFichaEmpresaService:", error);
        return [null, { message: "Error interno del servidor" }];
    } finally {
        await queryRunner.release();
    }
}

export async function descargarContratoService(id: number, userId: number): Promise<ServiceResponse<{filePath: string, customFilename: string}>> {
    try {
        console.log(`📋 [SERVICIO-DESCARGA-CONTRATO] Buscando ficha ID: ${id}`);
        
        const fichaRepo = AppDataSource.getRepository(FichaEmpresa);
        const userRepo = AppDataSource.getRepository(User);

        const ficha = await fichaRepo.findOne({
            where: { id },
            relations: ["trabajador"]
        });

        if (!ficha) {
            return [null, { message: "Ficha no encontrada" }];
        }

        console.log(`✅ [SERVICIO-DESCARGA-CONTRATO] Ficha encontrada - Trabajador: ${ficha.trabajador.nombres} ${ficha.trabajador.apellidoPaterno}`);

        if (ficha.trabajador && ficha.trabajador.rut === "11.111.111-1") {
            return [null, { message: "No se puede modificar ni eliminar la ficha del superadministrador." }];
        }

        const user = await userRepo.findOne({
            where: { id: userId },
            relations: ["trabajador"]
        });

        if (!user) {
            return [null, { message: "Usuario no encontrado" }];
        }

        console.log(`👤 [SERVICIO-DESCARGA-CONTRATO] Verificando usuario: ${user.rut}`);
        console.log(`👤 [SERVICIO-DESCARGA-CONTRATO] Usuario encontrado: ${user.nombres || 'undefined'} ${user.apellidos || 'undefined'} - Rol: ${user.role}`);

        // Permitir acceso a RRHH, Admin, Superadmin o al dueño de la ficha
        const esRRHH = user.role === "RecursosHumanos";
        const esAdmin = user.role === "Administrador";
        const esSuperAdmin = user.role === "SuperAdministrador";
        const esDueno = user.trabajador?.id === ficha.trabajador.id;

        const tienePrivilegios = esRRHH || esAdmin || esSuperAdmin || esDueno;
        console.log(`🔐 [SERVICIO-DESCARGA-CONTRATO] ¿Tiene privilegios? ${tienePrivilegios} (Rol: ${user.role})`);

        if (!tienePrivilegios) {
            return [null, { message: "No tiene permiso para descargar este contrato" }];
        }

        if (!ficha.contratoURL) {
            return [null, { message: "No hay contrato disponible para descargar" }];
        }

        console.log(`📁 [SERVICIO-DESCARGA-CONTRATO] URL del archivo: ${ficha.contratoURL}`);

        // Usar el servicio de archivos para obtener la ruta absoluta y correcta
        const filePath = FileUploadService.getContratoPath(ficha.contratoURL);
        
        console.log(`📂 [SERVICIO-DESCARGA-CONTRATO] Ruta calculada: ${filePath}`);

        // Verificar si el archivo existe
        if (!FileUploadService.fileExists(filePath)) {
            return [null, { message: "El archivo del contrato no se encuentra en el servidor." }];
        }

        // Generar nombre personalizado
        const trabajador = ficha.trabajador;
        console.log(`👤 [SERVICIO-DESCARGA-CONTRATO] Datos del trabajador - Nombres: "${trabajador.nombres}", Apellido P: "${trabajador.apellidoPaterno}", Apellido M: "${trabajador.apellidoMaterno}"`);

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

        console.log(`🧹 [SERVICIO-DESCARGA-CONTRATO] Nombres limpios - Nombres: "${nombresLimpios}", Apellido P: "${apellidoPLimpio}", Apellido M: "${apellidoMLimpio}"`);

        // Construir nombre personalizado
        let customFilename = '';
        if (nombresLimpios && apellidoPLimpio) {
            customFilename = `${nombresLimpios}_${apellidoPLimpio}`;
            if (apellidoMLimpio) {
                customFilename += `_${apellidoMLimpio}`;
            }
            customFilename += '-Contrato.pdf';
        }

        console.log(`📝 [SERVICIO-DESCARGA-CONTRATO] Nombre personalizado generado: "${customFilename}"`);

        // Validar que el nombre personalizado sea válido
        if (!customFilename || customFilename.length < 5 || !customFilename.includes('-Contrato.pdf')) {
            console.log(`❌ [SERVICIO-DESCARGA-CONTRATO] Nombre personalizado inválido, usando fallback`);
            customFilename = `Contrato_${id}.pdf`;
        }

        console.log(`✅ [SERVICIO-DESCARGA-CONTRATO] Permisos validados correctamente. Retornando datos.`);

        return [{ filePath, customFilename }, null];
    } catch (error) {
        console.error("Error en descargarContratoService:", error);
        return [null, { message: "Error interno del servidor" }];
    }
} 