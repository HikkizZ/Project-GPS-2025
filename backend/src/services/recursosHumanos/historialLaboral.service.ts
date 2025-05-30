import { AppDataSource } from "../../config/configDB.js";
import { HistorialLaboral } from "../../entity/recursosHumanos/historialLaboral.entity.js";
import { Trabajador } from "../../entity/recursosHumanos/trabajador.entity.js";
import { CreateHistorialLaboralDTO, UpdateHistorialLaboralDTO } from "../../types/recursosHumanos/historialLaboral.dto.js";
import { ServiceResponse } from "../../../types.js";
import { IsNull, DeepPartial } from "typeorm";

export async function createHistorialLaboralService(data: CreateHistorialLaboralDTO): Promise<ServiceResponse<HistorialLaboral>> {
    try {
        const historialRepo = AppDataSource.getRepository(HistorialLaboral);
        const trabajadorRepo = AppDataSource.getRepository(Trabajador);

        // Verificar que el trabajador existe
        const trabajador = await trabajadorRepo.findOne({
            where: { id: data.trabajadorId },
            relations: ["fichaEmpresa"]
        });
        if (!trabajador) {
            return [null, "Trabajador no encontrado."];
        }

        // Verificar que el trabajador esté activo
        if (!trabajador.enSistema) {
            return [null, "No se puede crear historial para un trabajador inactivo."];
        }

        // Verificar que no haya registros activos (sin fecha de fin) para este trabajador
        const registroActivo = await historialRepo.findOne({
            where: {
                trabajador: { id: data.trabajadorId },
                fechaFin: IsNull()
            }
        });

        if (registroActivo) {
            return [null, "El trabajador ya tiene un registro laboral activo. Debe cerrar el actual antes de crear uno nuevo."];
        }

        // Validar fechas
        const fechaInicio = new Date(data.fechaInicio);
        if (fechaInicio > new Date()) {
            return [null, "La fecha de inicio no puede ser futura."];
        }

        if (data.fechaFin) {
            const fechaFin = new Date(data.fechaFin);
            if (fechaFin < fechaInicio) {
                return [null, "La fecha de fin no puede ser anterior a la fecha de inicio."];
            }
        }

        // Crear nuevo registro
        const historialData: DeepPartial<HistorialLaboral> = {
            trabajador: { id: data.trabajadorId },
            cargo: data.cargo,
            area: data.area,
            tipoContrato: data.tipoContrato,
            sueldoBase: data.sueldoBase,
            fechaInicio: new Date(data.fechaInicio),
            fechaFin: data.fechaFin ? new Date(data.fechaFin) : undefined,
            motivoTermino: data.motivoTermino,
            contratoURL: data.contratoURL,
            registradoPor: data.registradoPor
        };

        const nuevoHistorial = historialRepo.create(historialData);
        await historialRepo.save(nuevoHistorial);
        return [nuevoHistorial, null];
    } catch (error) {
        console.error("Error al crear registro de historial laboral:", error);
        return [null, "Error interno del servidor."];
    }
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
            relations: ["trabajador", "registradoPor"],
            order: { fechaInicio: "DESC" }
        });

        return [historial, null];
    } catch (error) {
        console.error("Error al obtener historial laboral:", error);
        return [null, "Error al obtener historial laboral"];
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

export async function updateHistorialLaboralService(id: number, data: UpdateHistorialLaboralDTO): Promise<ServiceResponse<HistorialLaboral>> {
    try {
        const historialRepo = AppDataSource.getRepository(HistorialLaboral);
        const historial = await historialRepo.findOne({
            where: { id },
            relations: ["trabajador"]
        });

        if (!historial) {
            return [null, "Registro de historial laboral no encontrado."];
        }

        if (historial.fechaFin) {
            return [null, "No se puede actualizar un registro que ya está cerrado."];
        }

        // Validar fechas
        const fechaFin = new Date(data.fechaFin);
        if (fechaFin < historial.fechaInicio) {
            return [null, "La fecha de fin no puede ser anterior a la fecha de inicio."];
        }

        // Actualizar campos
        historial.fechaFin = fechaFin;
        historial.motivoTermino = data.motivoTermino;

        await historialRepo.save(historial);
        return [historial, null];
    } catch (error) {
        console.error("Error al actualizar registro de historial laboral:", error);
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