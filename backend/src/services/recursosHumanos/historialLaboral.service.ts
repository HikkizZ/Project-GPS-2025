import { AppDataSource } from "../../config/configDB.js";
import { HistorialLaboral } from "../../entity/recursosHumanos/historialLaboral.entity.js";
import { Trabajador } from "../../entity/recursosHumanos/trabajador.entity.js";
import { CreateHistorialLaboralDTO, UpdateHistorialLaboralDTO } from "../../types/recursosHumanos/historialLaboral.dto.js";
import { ServiceResponse } from "../../../types.js";
import { IsNull, DeepPartial } from "typeorm";
import { FichaEmpresa, EstadoLaboral } from "../../entity/recursosHumanos/fichaEmpresa.entity.js";

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

export async function procesarCambioLaboralService(
    trabajadorId: number,
    tipo: 'DESVINCULACION' | 'CAMBIO_CARGO' | 'CAMBIO_AREA' | 'CAMBIO_CONTRATO' | 'CAMBIO_SUELDO',
    datos: {
        fechaInicio: Date;
        motivo: string;
        registradoPor: any;
        cargo?: string;
        area?: string;
        tipoContrato?: string;
        sueldoBase?: number;
    }
): Promise<ServiceResponse<HistorialLaboral>> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const trabajadorRepo = queryRunner.manager.getRepository(Trabajador);
        const fichaRepo = queryRunner.manager.getRepository(FichaEmpresa);
        const historialRepo = queryRunner.manager.getRepository(HistorialLaboral);

        const trabajador = await trabajadorRepo.findOne({
            where: { id: trabajadorId },
            relations: ["fichaEmpresa"]
        });

        if (!trabajador) {
            await queryRunner.release();
            return [null, "Trabajador no encontrado"];
        }

        const fichaEmpresa = trabajador.fichaEmpresa;
        if (!fichaEmpresa) {
            await queryRunner.release();
            return [null, "Ficha de empresa no encontrada"];
        }

        // Validar que el trabajador no esté desvinculado
        if (fichaEmpresa.estado === EstadoLaboral.DESVINCULADO && tipo !== 'DESVINCULACION') {
            await queryRunner.release();
            return [null, "No se pueden realizar cambios en un trabajador desvinculado"];
        }

        // Crear nuevo registro en historial laboral
        const nuevoHistorial = new HistorialLaboral();
        nuevoHistorial.trabajador = trabajador;
        nuevoHistorial.cargo = fichaEmpresa.cargo;
        nuevoHistorial.area = fichaEmpresa.area;
        nuevoHistorial.tipoContrato = fichaEmpresa.tipoContrato;
        nuevoHistorial.sueldoBase = fichaEmpresa.sueldoBase;
        nuevoHistorial.fechaInicio = datos.fechaInicio;
        nuevoHistorial.registradoPor = datos.registradoPor;

        // Procesar según el tipo de cambio
        switch (tipo) {
            case 'DESVINCULACION':
                fichaEmpresa.estado = EstadoLaboral.DESVINCULADO;
                fichaEmpresa.fechaFinContrato = datos.fechaInicio;
                nuevoHistorial.fechaFin = datos.fechaInicio;
                nuevoHistorial.motivoTermino = datos.motivo;
                trabajador.enSistema = false;
                break;

            case 'CAMBIO_CARGO':
                if (!datos.cargo) {
                    await queryRunner.release();
                    return [null, "El cargo es requerido para este tipo de cambio"];
                }
                fichaEmpresa.cargo = datos.cargo;
                nuevoHistorial.motivoTermino = datos.motivo;
                break;

            case 'CAMBIO_AREA':
                if (!datos.area) {
                    await queryRunner.release();
                    return [null, "El área es requerida para este tipo de cambio"];
                }
                fichaEmpresa.area = datos.area;
                nuevoHistorial.motivoTermino = datos.motivo;
                break;

            case 'CAMBIO_CONTRATO':
                if (!datos.tipoContrato) {
                    await queryRunner.release();
                    return [null, "El tipo de contrato es requerido para este tipo de cambio"];
                }
                fichaEmpresa.tipoContrato = datos.tipoContrato;
                nuevoHistorial.motivoTermino = datos.motivo;
                break;

            case 'CAMBIO_SUELDO':
                if (!datos.sueldoBase || datos.sueldoBase <= 0) {
                    await queryRunner.release();
                    return [null, "El sueldo base debe ser mayor a 0"];
                }
                if (datos.sueldoBase < fichaEmpresa.sueldoBase) {
                    await queryRunner.release();
                    return [null, "El nuevo sueldo no puede ser menor al actual"];
                }
                fichaEmpresa.sueldoBase = datos.sueldoBase;
                nuevoHistorial.motivoTermino = datos.motivo;
                break;
        }

        // Guardar los cambios
        await queryRunner.manager.save(HistorialLaboral, nuevoHistorial);
        await queryRunner.manager.save(FichaEmpresa, fichaEmpresa);
        await queryRunner.manager.save(Trabajador, trabajador);

        await queryRunner.commitTransaction();
        await queryRunner.release();

        return [nuevoHistorial, null];
    } catch (error) {
        console.error("Error al procesar cambio laboral:", error);
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        return [null, "Error interno del servidor"];
    }
} 