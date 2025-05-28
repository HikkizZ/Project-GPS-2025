import { AppDataSource } from "../../config/configDB.js";
import { Trabajador } from "../../entity/recursosHumanos/trabajador.entity.js";
import { FichaEmpresa, EstadoLaboral } from "../../entity/recursosHumanos/fichaEmpresa.entity.js";
import { ServiceResponse } from "../../../types.js";
import { Not, DeepPartial } from "typeorm";
import { validateRut } from "../../helpers/rut.helper.js";

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
            return [null, new Error("Ya existe un trabajador con ese RUT o correo")];
        }

        // Crear el trabajador
        const { fichaEmpresa, ...trabajadorInfo } = trabajadorData;
        const trabajador = trabajadorRepo.create(trabajadorInfo);
        const trabajadorGuardado = await trabajadorRepo.save(trabajador);

        // Crear la ficha de empresa asociada
        const fichaData: DeepPartial<FichaEmpresa> = {
            cargo: fichaEmpresa?.cargo ?? "Sin cargo",
            area: fichaEmpresa?.area ?? "Sin área",
            empresa: fichaEmpresa?.empresa ?? undefined,
            tipoContrato: fichaEmpresa?.tipoContrato ?? "Indefinido",
            jornadaLaboral: fichaEmpresa?.jornadaLaboral ?? undefined,
            sueldoBase: fichaEmpresa?.sueldoBase ?? 0,
            trabajador: trabajadorGuardado,
            estado: EstadoLaboral.ACTIVO,
            fechaInicioContrato: trabajadorGuardado.fechaIngreso,
            contratoURL: fichaEmpresa?.contratoURL ?? undefined
        };

        const ficha = fichaRepo.create(fichaData);
        await fichaRepo.save(ficha);

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
            relations: ["fichaEmpresa"],
            where: { enSistema: true }
        });

        return [trabajadores, null];
    } catch (error) {
        console.error("Error en getTrabajadoresService:", error);
        return [null, error as Error];
    }
}

export async function getTrabajadorByIdService(id: number): Promise<ServiceResponse<Trabajador>> {
    try {
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);
        const trabajador = await trabajadorRepo.findOne({
            where: { id, enSistema: true },
            relations: ["fichaEmpresa", "historialLaboral", "licenciasPermisos", "capacitaciones"]
        });

        if (!trabajador) {
            return [null, new Error("Trabajador no encontrado")];
        }

        return [trabajador, null];
    } catch (error) {
        console.error("Error en getTrabajadorByIdService:", error);
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