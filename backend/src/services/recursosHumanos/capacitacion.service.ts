import { AppDataSource } from "../../config/configDB.js";
import { Capacitacion } from "../../entity/recursosHumanos/capacitacion.entity.js";
import { Trabajador } from "../../entity/recursosHumanos/trabajador.entity.js";
import { CreateCapacitacionDTO, UpdateCapacitacionDTO, CapacitacionQueryDTO } from "../../types/recursosHumanos/capacitacion.dto.js";
import { ServiceResponse } from "../../../types.js";
import { Between, Like, FindManyOptions, DeepPartial } from "typeorm";
import { FileManagementService } from "../fileManagement.service.js";

/**
 * Crear una nueva capacitación
 */
export async function createCapacitacionService(data: CreateCapacitacionDTO): Promise<ServiceResponse<Capacitacion>> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const trabajadorRepo = queryRunner.manager.getRepository(Trabajador);
        const capacitacionRepo = queryRunner.manager.getRepository(Capacitacion);

        // Verificar que el trabajador existe y está activo
        const trabajador = await trabajadorRepo.findOne({
            where: { id: data.trabajadorId }
        });

        if (!trabajador) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return [null, "Trabajador no encontrado"];
        }

        if (!trabajador.enSistema) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return [null, "No se puede registrar capacitación para un trabajador inactivo"];
        }

        // Procesar archivo adjunto si existe
        let certificadoURL: string | undefined;
        if (data.file) {
            const fileInfo = FileManagementService.processUploadedFile(data.file);
            certificadoURL = fileInfo.url;
        } else if (data.certificadoURL) {
            certificadoURL = data.certificadoURL;
        }

        // Validar fecha
        const fechaCapacitacion = new Date(data.fecha);
        const hoy = new Date();
        hoy.setHours(23, 59, 59, 999);

        if (fechaCapacitacion > hoy) {
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
            return [null, "La fecha de la capacitación no puede ser futura"];
        }

        // Crear la capacitación
        const capacitacionData: DeepPartial<Capacitacion> = {
            trabajador: { id: data.trabajadorId },
            nombreCurso: data.nombreCurso,
            institucion: data.institucion,
            fecha: fechaCapacitacion,
            duracion: data.duracion,
            certificadoURL: certificadoURL
        };

        const nuevaCapacitacion = capacitacionRepo.create(capacitacionData);
        await queryRunner.manager.save(nuevaCapacitacion);
        await queryRunner.commitTransaction();

        // Cargar la capacitación completa con relaciones
        const capacitacionCompleta = await capacitacionRepo.findOne({
            where: { id: nuevaCapacitacion.id },
            relations: ["trabajador"]
        });

        return [capacitacionCompleta!, null];
    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("Error al crear capacitación:", error);
        return [null, "Error interno del servidor"];
    } finally {
        await queryRunner.release();
    }
}

/**
 * Obtener todas las capacitaciones con filtros opcionales
 */
export async function getAllCapacitacionesService(query: CapacitacionQueryDTO = {}): Promise<ServiceResponse<{ capacitaciones: Capacitacion[]; total: number }>> {
    try {
        const capacitacionRepo = AppDataSource.getRepository(Capacitacion);
        
        const options: FindManyOptions<Capacitacion> = {
            relations: ["trabajador"],
            order: { fecha: "DESC" },
            take: query.limit || 10,
            skip: query.offset || 0
        };

        // Construir where clause
        const whereConditions: any = {};

        if (query.trabajadorId) {
            whereConditions.trabajador = { id: query.trabajadorId };
        }

        if (query.institucion) {
            whereConditions.institucion = Like(`%${query.institucion}%`);
        }

        if (query.fechaDesde && query.fechaHasta) {
            whereConditions.fecha = Between(new Date(query.fechaDesde), new Date(query.fechaHasta));
        } else if (query.fechaDesde) {
            whereConditions.fecha = Between(new Date(query.fechaDesde), new Date());
        } else if (query.fechaHasta) {
            whereConditions.fecha = Between(new Date('1900-01-01'), new Date(query.fechaHasta));
        }

        if (Object.keys(whereConditions).length > 0) {
            options.where = whereConditions;
        }

        const [capacitaciones, total] = await capacitacionRepo.findAndCount(options);

        return [{ capacitaciones, total }, null];
    } catch (error) {
        console.error("Error al obtener capacitaciones:", error);
        return [null, "Error interno del servidor"];
    }
}

/**
 * Obtener capacitación por ID
 */
export async function getCapacitacionByIdService(id: number): Promise<ServiceResponse<Capacitacion>> {
    try {
        const capacitacionRepo = AppDataSource.getRepository(Capacitacion);
        const capacitacion = await capacitacionRepo.findOne({
            where: { id },
            relations: ["trabajador"]
        });

        if (!capacitacion) {
            return [null, "Capacitación no encontrada"];
        }

        return [capacitacion, null];
    } catch (error) {
        console.error("Error al obtener capacitación:", error);
        return [null, "Error interno del servidor"];
    }
}

/**
 * Obtener capacitaciones por trabajador
 */
export async function getCapacitacionesByTrabajadorService(trabajadorId: number): Promise<ServiceResponse<Capacitacion[]>> {
    try {
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        const trabajador = await trabajadorRepo.findOne({
            where: { id: trabajadorId }
        });

        if (!trabajador) {
            return [null, "Trabajador no encontrado"];
        }

        const capacitacionRepo = AppDataSource.getRepository(Capacitacion);
        const capacitaciones = await capacitacionRepo.find({
            where: { trabajador: { id: trabajadorId } },
            relations: ["trabajador"],
            order: { fecha: "DESC" }
        });

        return [capacitaciones, null];
    } catch (error) {
        console.error("Error al obtener capacitaciones del trabajador:", error);
        return [null, "Error interno del servidor"];
    }
}

/**
 * Actualizar capacitación
 */
export async function updateCapacitacionService(id: number, data: UpdateCapacitacionDTO): Promise<ServiceResponse<Capacitacion>> {
    try {
        const capacitacionRepo = AppDataSource.getRepository(Capacitacion);
        const capacitacion = await capacitacionRepo.findOne({
            where: { id },
            relations: ["trabajador"]
        });

        if (!capacitacion) {
            return [null, "Capacitación no encontrada"];
        }

        // Validar fecha si se proporciona
        if (data.fecha) {
            const fechaCapacitacion = new Date(data.fecha);
            const hoy = new Date();
            hoy.setHours(23, 59, 59, 999);

            if (fechaCapacitacion > hoy) {
                return [null, "La fecha de la capacitación no puede ser futura"];
            }
            capacitacion.fecha = fechaCapacitacion;
        }

        // Actualizar campos si se proporcionan
        if (data.nombreCurso) capacitacion.nombreCurso = data.nombreCurso;
        if (data.institucion) capacitacion.institucion = data.institucion;
        if (data.duracion) capacitacion.duracion = data.duracion;
        if (data.certificadoURL !== undefined) capacitacion.certificadoURL = data.certificadoURL;

        await capacitacionRepo.save(capacitacion);
        return [capacitacion, null];
    } catch (error) {
        console.error("Error al actualizar capacitación:", error);
        return [null, "Error interno del servidor"];
    }
}

/**
 * Eliminar capacitación
 */
export async function deleteCapacitacionService(id: number): Promise<ServiceResponse<Capacitacion>> {
    try {
        const capacitacionRepo = AppDataSource.getRepository(Capacitacion);
        const capacitacion = await capacitacionRepo.findOne({
            where: { id },
            relations: ["trabajador"]
        });

        if (!capacitacion) {
            return [null, "Capacitación no encontrada"];
        }

        // Eliminar archivo adjunto si existe
        if (capacitacion.certificadoURL) {
            const [deleted, error] = FileManagementService.deleteFile(capacitacion.certificadoURL);
            if (error) {
                console.warn("No se pudo eliminar el archivo:", error);
            }
        }

        await capacitacionRepo.remove(capacitacion);
        return [capacitacion, null];
    } catch (error) {
        console.error("Error al eliminar capacitación:", error);
        return [null, "Error interno del servidor"];
    }
}

/**
 * Descargar certificado de capacitación
 */
export async function descargarCertificadoService(id: number, userRut: string): Promise<ServiceResponse<string>> {
    try {
        const capacitacionRepo = AppDataSource.getRepository(Capacitacion);
        const capacitacion = await capacitacionRepo.findOne({
            where: { id },
            relations: ["trabajador"]
        });

        if (!capacitacion) {
            return [null, "Capacitación no encontrada"];
        }

        if (!capacitacion.certificadoURL) {
            return [null, "No hay certificado disponible para esta capacitación"];
        }

        // Validar permisos: solo el trabajador propietario o RRHH pueden descargar
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        const trabajador = await trabajadorRepo.findOne({ where: { rut: userRut } });
        
        if (!trabajador) {
            return [null, "Trabajador no encontrado"];
        }

        // Verificar si el usuario es el propietario de la capacitación o es RRHH
        if (capacitacion.trabajador.id !== trabajador.id) {
            return [null, "No tiene permisos para descargar este certificado"];
        }

        return [capacitacion.certificadoURL, null];
    } catch (error) {
        console.error("Error al obtener certificado:", error);
        return [null, "Error interno del servidor"];
    }
} 