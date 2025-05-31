import { AppDataSource } from "../../config/configDB.js";
import { Trabajador } from "../../entity/recursosHumanos/trabajador.entity.js";
import { FichaEmpresa, EstadoLaboral } from "../../entity/recursosHumanos/fichaEmpresa.entity.js";
import { ServiceResponse } from "../../../types.js";
import { Not, DeepPartial } from "typeorm";
import { validateRut } from "../../helpers/rut.helper.js";
import { ILike, Like } from "typeorm";
import { FindOptionsWhere } from "typeorm";

export async function createTrabajadorService(trabajadorData: Partial<Trabajador>): Promise<ServiceResponse<Trabajador>> {
    try {
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        const fichaRepo = AppDataSource.getRepository(FichaEmpresa);

        // Validar datos requeridos
        if (!trabajadorData.rut || !trabajadorData.nombres || !trabajadorData.apellidoPaterno || 
            !trabajadorData.apellidoMaterno || !trabajadorData.telefono || !trabajadorData.correo || 
            !trabajadorData.direccion || !trabajadorData.fechaIngreso) {
            return [null, "Faltan campos requeridos"];
        }

        // Validar formato de RUT usando el helper
        if (!validateRut(trabajadorData.rut)) {
            return [null, "Formato de RUT inválido"];
        }

        // Limpiar el RUT antes de guardarlo (remover puntos pero mantener el guión)
        trabajadorData.rut = trabajadorData.rut.replace(/\./g, '');

        // Validar formato de correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trabajadorData.correo)) {
            return [null, "Formato de correo inválido"];
        }

        // Validar formato de teléfono (debe tener entre 9 y 12 dígitos)
        const phoneRegex = /^\+?[\d]{9,12}$/;
        if (!phoneRegex.test(trabajadorData.telefono)) {
            return [null, "Formato de teléfono inválido"];
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
                return [null, "Ya existe un trabajador con ese RUT"];
            }
            if (existingTrabajador.correo === trabajadorData.correo) {
                return [null, "Ya existe un trabajador con ese correo"];
            }
        }

        // Crear el trabajador
        const trabajador = trabajadorRepo.create({
            ...trabajadorData,
            enSistema: true
        });
        const trabajadorGuardado = await trabajadorRepo.save(trabajador);

        // SIEMPRE crear la ficha de empresa con valores por defecto
        const fichaData: DeepPartial<FichaEmpresa> = {
            cargo: trabajadorData.fichaEmpresa?.cargo ?? "Sin cargo",
            area: trabajadorData.fichaEmpresa?.area ?? "Sin área", 
            empresa: trabajadorData.fichaEmpresa?.empresa ?? "GPS",
            tipoContrato: trabajadorData.fichaEmpresa?.tipoContrato ?? "Indefinido",
            jornadaLaboral: trabajadorData.fichaEmpresa?.jornadaLaboral ?? "Por definir",
            sueldoBase: trabajadorData.fichaEmpresa?.sueldoBase ?? 0,
            trabajador: trabajadorGuardado,
            estado: EstadoLaboral.ACTIVO,
            fechaInicioContrato: trabajadorGuardado.fechaIngreso,
            contratoURL: trabajadorData.fichaEmpresa?.contratoURL
        };

        const ficha = fichaRepo.create(fichaData);
        const fichaGuardada = await fichaRepo.save(ficha);

        // Actualizar el trabajador con la referencia a la ficha
        trabajadorGuardado.fichaEmpresa = fichaGuardada;
        await trabajadorRepo.save(trabajadorGuardado);

        // Recargar el trabajador con todas sus relaciones
        const trabajadorCompleto = await trabajadorRepo.findOne({
            where: { id: trabajadorGuardado.id },
            relations: ["fichaEmpresa"]
        });

        if (!trabajadorCompleto) {
            throw new Error("No se pudo recargar el trabajador después de crear la ficha");
        }

        // Asegurarnos de que la ficha esté cargada
        if (!trabajadorCompleto.fichaEmpresa) {
            throw new Error("No se pudo cargar la ficha de empresa del trabajador");
        }

        return [trabajadorCompleto, null];
    } catch (error) {
        console.error("Error en createTrabajadorService:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function getTrabajadoresService(incluirInactivos: boolean = false): Promise<ServiceResponse<Trabajador[]>> {
    try {
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        const trabajadores = await trabajadorRepo.find({
            relations: ["fichaEmpresa", "historialLaboral", "licenciasPermisos", "capacitaciones"],
            where: incluirInactivos ? {} : { enSistema: true }
        });

        if (!trabajadores.length) {
            return [null, "No hay trabajadores registrados"];
        }

        return [trabajadores, null];
    } catch (error) {
        console.error("Error en getTrabajadoresService:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function searchTrabajadoresService(query: any): Promise<ServiceResponse<Trabajador[]>> {
    try {
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        
        // Construir where clause
        const whereClause: any = {};
        
        if (query.rut) whereClause.rut = Like(`%${query.rut}%`);
        if (query.nombres) whereClause.nombres = Like(`%${query.nombres}%`);
        if (query.apellidoPaterno) whereClause.apellidoPaterno = Like(`%${query.apellidoPaterno}%`);
        if (query.apellidoMaterno) whereClause.apellidoMaterno = Like(`%${query.apellidoMaterno}%`);
        if (query.correo) whereClause.correo = Like(`%${query.correo}%`);
        if (query.telefono) whereClause.telefono = Like(`%${query.telefono}%`);
        
        // Solo incluir trabajadores activos a menos que se especifique lo contrario
        if (!query.todos) {
            whereClause.enSistema = true;
        }

        const trabajadores = await trabajadorRepo.find({
            where: whereClause,
            relations: ["fichaEmpresa", "historialLaboral", "licenciasPermisos", "capacitaciones"]
        });

        return [trabajadores, null];
    } catch (error) {
        console.error("Error en searchTrabajadoresService:", error);
        return [null, "Error interno del servidor"];
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
            return [null, "Trabajador no encontrado"];
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
                return [null, "Ya existe un trabajador con ese RUT o correo"];
            }
        }

        // Actualizar campos
        Object.assign(trabajador, trabajadorData);
        const trabajadorActualizado = await trabajadorRepo.save(trabajador);

        return [trabajadorActualizado, null];
    } catch (error) {
        console.error("Error en updateTrabajadorService:", error);
        return [null, "Error interno del servidor"];
    }
}

export async function deleteTrabajadorService(id: number): Promise<ServiceResponse<boolean>> {
    try {
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        const trabajador = await trabajadorRepo.findOne({
            where: { id, enSistema: true }
        });

        if (!trabajador) {
            return [null, "Trabajador no encontrado"];
        }

        // En lugar de eliminar, marcamos como inactivo
        trabajador.enSistema = false;
        await trabajadorRepo.save(trabajador);

        return [true, null];
    } catch (error) {
        console.error("Error en deleteTrabajadorService:", error);
        return [null, "Error interno del servidor"];
    }
} 