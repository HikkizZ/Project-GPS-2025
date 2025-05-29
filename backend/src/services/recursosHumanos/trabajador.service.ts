import { AppDataSource } from "../../config/configDB.js";
import { Trabajador } from "../../entity/recursosHumanos/trabajador.entity.js";
import { FichaEmpresa, EstadoLaboral } from "../../entity/recursosHumanos/fichaEmpresa.entity.js";
import { ServiceResponse } from "../../../types.js";
import { Not, DeepPartial } from "typeorm";
import { validateRut } from "../../helpers/rut.helper.js";
import { ILike } from "typeorm";
import { FindOptionsWhere } from "typeorm";

export async function createTrabajadorService(trabajadorData: Partial<Trabajador>): Promise<ServiceResponse<Trabajador>> {
    try {
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        const fichaRepo = AppDataSource.getRepository(FichaEmpresa);

        // Validar datos requeridos
        if (!trabajadorData.rut || !trabajadorData.nombres || !trabajadorData.apellidoPaterno || 
            !trabajadorData.apellidoMaterno || !trabajadorData.telefono || !trabajadorData.correo || 
            !trabajadorData.direccion || !trabajadorData.fechaIngreso) {
            return [null, new Error("Faltan campos requeridos")];
        }

        // Validar formato de RUT usando el helper
        if (!validateRut(trabajadorData.rut)) {
            return [null, new Error("Formato de RUT inválido")];
        }

        // Validar formato de correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trabajadorData.correo)) {
            return [null, new Error("Formato de correo inválido")];
        }

        // Validar formato de teléfono (debe tener entre 9 y 12 dígitos)
        const phoneRegex = /^\+?[\d]{9,12}$/;
        if (!phoneRegex.test(trabajadorData.telefono)) {
            return [null, new Error("Formato de teléfono inválido")];
        }

        // Verificar si ya existe un trabajador con el mismo RUT o correo
        const existingTrabajador = await trabajadorRepo.findOne({
            where: [
                { rut: trabajadorData.rut },
                { correo: trabajadorData.correo }
            ]
        });

        if (existingTrabajador) {
            if (existingTrabajador.rut === trabajadorData.rut) {
                return [null, new Error("Ya existe un trabajador con ese RUT")];
            }
            if (existingTrabajador.correo === trabajadorData.correo) {
                return [null, new Error("Ya existe un trabajador con ese correo")];
            }
        }

        // Crear el trabajador
        const trabajador = trabajadorRepo.create({
            ...trabajadorData,
            enSistema: true
        });
        const trabajadorGuardado = await trabajadorRepo.save(trabajador);

        // Crear la ficha de empresa asociada si se proporcionaron datos
        if (trabajadorData.fichaEmpresa) {
            const fichaData: DeepPartial<FichaEmpresa> = {
                cargo: trabajadorData.fichaEmpresa.cargo ?? "Sin cargo",
                area: trabajadorData.fichaEmpresa.area ?? "Sin área",
                empresa: trabajadorData.fichaEmpresa.empresa,
                tipoContrato: trabajadorData.fichaEmpresa.tipoContrato ?? "Indefinido",
                jornadaLaboral: trabajadorData.fichaEmpresa.jornadaLaboral,
                sueldoBase: trabajadorData.fichaEmpresa.sueldoBase ?? 0,
                trabajador: trabajadorGuardado,
                estado: EstadoLaboral.ACTIVO,
                fechaInicioContrato: trabajadorGuardado.fechaIngreso,
                contratoURL: trabajadorData.fichaEmpresa.contratoURL
            };

            const ficha = fichaRepo.create(fichaData);
            await fichaRepo.save(ficha);
        }

        return [trabajadorGuardado, null];
    } catch (error) {
        console.error("Error en createTrabajadorService:", error);
        return [null, error as Error];
    }
}

export async function getTrabajadoresService(): Promise<ServiceResponse<Trabajador[]>> {
    try {
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        const trabajadores = await trabajadorRepo.find({
            relations: ["fichaEmpresa", "historialLaboral", "licenciasPermisos", "capacitaciones"],
            where: { enSistema: true }
        });

        if (!trabajadores.length) {
            return [null, new Error("No hay trabajadores registrados")];
        }

        return [trabajadores, null];
    } catch (error) {
        console.error("Error en getTrabajadoresService:", error);
        return [null, error as Error];
    }
}

export async function searchTrabajadoresService(query: any): Promise<ServiceResponse<Trabajador[]>> {
    try {
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);

        const whereClause: FindOptionsWhere<Trabajador> = {};

        // Solo agregar filtro enSistema si NO viene el parámetro todos=true
        if (query.todos !== true) {
            whereClause.enSistema = query.enSistema !== undefined ? query.enSistema : true;
        }

        if (query.rut) {
            whereClause.rut = ILike(`%${query.rut}%`);
        }

        if (query.nombres) {
            whereClause.nombres = ILike(`%${query.nombres}%`);
        }

        if (query.apellidoPaterno) {
            whereClause.apellidoPaterno = ILike(`%${query.apellidoPaterno}%`);
        }

        if (query.apellidoMaterno) {
            whereClause.apellidoMaterno = ILike(`%${query.apellidoMaterno}%`);
        }

        if (query.correo) {
            whereClause.correo = ILike(`%${query.correo}%`);
        }

        if (query.telefono) {
            whereClause.telefono = ILike(`%${query.telefono}%`);
        }

        const trabajadores = await trabajadorRepo.find({
            where: whereClause,
            relations: ["fichaEmpresa", "historialLaboral", "licenciasPermisos", "capacitaciones"],
            order: { id: "ASC" }
        });

        if (!trabajadores.length) {
            return [null, new Error("No hay trabajadores que coincidan con los criterios de búsqueda")];
        }

        return [trabajadores, null];
    } catch (error) {
        console.error("Error en searchTrabajadoresService:", error);
        return [null, error as Error];
    }
}

export async function updateTrabajadorService(id: number, trabajadorData: Partial<Trabajador>): Promise<ServiceResponse<Trabajador>> {
    try {
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        
        // Buscar el trabajador
        const trabajador = await trabajadorRepo.findOne({
            where: { id, enSistema: true }
        });

        if (!trabajador) {
            return [null, new Error("Trabajador no encontrado")];
        }

        // Si se está actualizando el RUT o correo, verificar que no exista otro trabajador con esos datos
        if (trabajadorData.rut || trabajadorData.correo) {
            const existingTrabajador = await trabajadorRepo.findOne({
                where: [
                    { rut: trabajadorData.rut || "", id: Not(id) },
                    { correo: trabajadorData.correo || "", id: Not(id) }
                ]
            });

            if (existingTrabajador) {
                return [null, new Error("Ya existe un trabajador con ese RUT o correo")];
            }
        }

        // Actualizar campos
        Object.assign(trabajador, trabajadorData);
        const trabajadorActualizado = await trabajadorRepo.save(trabajador);

        return [trabajadorActualizado, null];
    } catch (error) {
        console.error("Error en updateTrabajadorService:", error);
        return [null, error as Error];
    }
}

export async function deleteTrabajadorService(id: number): Promise<ServiceResponse<boolean>> {
    try {
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        const trabajador = await trabajadorRepo.findOne({
            where: { id, enSistema: true }
        });

        if (!trabajador) {
            return [null, new Error("Trabajador no encontrado")];
        }

        // En lugar de eliminar, marcamos como inactivo
        trabajador.enSistema = false;
        await trabajadorRepo.save(trabajador);

        return [true, null];
    } catch (error) {
        console.error("Error en deleteTrabajadorService:", error);
        return [null, error as Error];
    }
} 