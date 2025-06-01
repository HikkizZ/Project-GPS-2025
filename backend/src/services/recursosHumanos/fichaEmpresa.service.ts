import { AppDataSource } from "../../config/configDB.js";
import { FichaEmpresa, EstadoLaboral } from "../../entity/recursosHumanos/fichaEmpresa.entity.js";
import { ServiceResponse } from "../../../types.js";
import { FindOptionsWhere, ILike, LessThanOrEqual, MoreThanOrEqual, Between, In } from "typeorm";
import { Trabajador } from "../../entity/recursosHumanos/trabajador.entity.js";
import { User } from "../../entity/user.entity.js";
import { LicenciaPermiso, TipoSolicitud, EstadoSolicitud } from "../../entity/recursosHumanos/licenciaPermiso.entity.js";

// Interfaz para los parámetros de búsqueda
interface SearchFichaParams {
    // Búsqueda por trabajador
    trabajadorId?: number;
    rut?: string;

    // Búsqueda por estado
    estado?: EstadoLaboral;

    // Búsqueda por información laboral
    cargo?: string;
    area?: string;
    empresa?: string;
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
}

export async function searchFichasEmpresa(params: SearchFichaParams): Promise<ServiceResponse<FichaEmpresa[]>> {
    try {
        const fichaRepo = AppDataSource.getRepository(FichaEmpresa);
        const queryBuilder = fichaRepo.createQueryBuilder("ficha")
            .leftJoinAndSelect("ficha.trabajador", "trabajador");

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
        }

        // Filtros por información laboral (búsqueda parcial)
        if (params.cargo) {
            queryBuilder.andWhere("ficha.cargo ILIKE :cargo", { cargo: `%${params.cargo}%` });
        }
        if (params.area) {
            queryBuilder.andWhere("ficha.area ILIKE :area", { area: `%${params.area}%` });
        }
        if (params.empresa) {
            queryBuilder.andWhere("ficha.empresa ILIKE :empresa", { empresa: `%${params.empresa}%` });
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
            if (params.fechaFinDesde) {
                queryBuilder.andWhere("ficha.fechaFinContrato >= :fechaFinDesde", 
                    { fechaFinDesde: params.fechaFinDesde });
            }
            if (params.fechaFinHasta) {
                queryBuilder.andWhere("ficha.fechaFinContrato <= :fechaFinHasta", 
                    { fechaFinHasta: params.fechaFinHasta });
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
            relations: ["trabajador"]
        });

        if (!ficha) {
            return [null, { message: "Ficha no encontrada" }];
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
            relations: ["trabajador"]
        });

        if (!ficha) {
            return [null, { message: "Ficha no encontrada" }];
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
            relations: ["trabajador"]
        });

        if (!ficha) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return [null, { message: "Ficha no encontrada" }];
        }

        // Verificar permisos del usuario
        if (userId) {
            const userRepo = queryRunner.manager.getRepository(User);
            const user = await userRepo.findOne({ where: { id: userId } });
            if (!user || (user.role !== "RecursosHumanos" && user.role !== "Administrador")) {
                await queryRunner.rollbackTransaction();
                await queryRunner.release();
                return [null, { message: "No tiene permiso para cambiar el estado de la ficha" }];
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

        // Actualizar el estado y otros campos
        ficha.estado = estado;

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
const CAMPOS_ESTADO_DESVINCULADO = ['cargo', 'area', 'empresa', 'tipoContrato', 'jornadaLaboral', 'sueldoBase'] as const;

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
            relations: ["trabajador"]
        });

        if (!fichaActual) {
            return [null, { message: "Ficha no encontrada" }];
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
                return [null, { message: "El sueldo base debe ser mayor a cero" }];
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

export async function descargarContratoService(id: number, userId: number): Promise<ServiceResponse<string>> {
    try {
        const fichaRepo = AppDataSource.getRepository(FichaEmpresa);
        const userRepo = AppDataSource.getRepository(User);

        const ficha = await fichaRepo.findOne({
            where: { id },
            relations: ["trabajador"]
        });

        if (!ficha) {
            return [null, { message: "Ficha no encontrada" }];
        }

        const user = await userRepo.findOne({
            where: { id: userId },
            relations: ["trabajador"]
        });

        if (!user) {
            return [null, { message: "Usuario no encontrado" }];
        }

        // Permitir acceso a RRHH o al dueño de la ficha
        const esRRHH = user.role === "RecursosHumanos";
        const esDueno = user.trabajador?.id === ficha.trabajador.id;

        if (!esRRHH && !esDueno) {
            return [null, { message: "No tiene permiso para descargar este contrato" }];
        }

        if (!ficha.contratoURL) {
            return [null, { message: "No hay contrato disponible para descargar" }];
        }

        return [ficha.contratoURL, null];
    } catch (error) {
        console.error("Error en descargarContratoService:", error);
        return [null, { message: "Error interno del servidor" }];
    }
} 