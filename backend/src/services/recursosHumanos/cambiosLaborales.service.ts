import { AppDataSource } from "../../config/configDB.js";
import { ServiceResponse } from "../../../types.js";
import { TipoCambioLaboral, DatosCambioLaboral, RespuestaCambioLaboral } from "../../types/recursosHumanos/cambiosLaborales.types.js";
import { FichaEmpresa, EstadoLaboral } from "../../entity/recursosHumanos/fichaEmpresa.entity.js";
import { HistorialLaboral } from "../../entity/recursosHumanos/historialLaboral.entity.js";
import { Trabajador } from "../../entity/recursosHumanos/trabajador.entity.js";

export async function procesarCambioLaboralService(
    tipo: TipoCambioLaboral,
    datos: DatosCambioLaboral
): Promise<ServiceResponse<RespuestaCambioLaboral>> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        // 1. Obtener las entidades necesarias
        const trabajadorRepo = queryRunner.manager.getRepository(Trabajador);
        const fichaRepo = queryRunner.manager.getRepository(FichaEmpresa);
        const historialRepo = queryRunner.manager.getRepository(HistorialLaboral);

        const trabajador = await trabajadorRepo.findOne({
            where: { id: datos.trabajadorId },
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
        if (fichaEmpresa.estado === EstadoLaboral.DESVINCULADO && tipo !== TipoCambioLaboral.DESVINCULACION) {
            await queryRunner.release();
            return [null, "No se pueden realizar cambios en un trabajador desvinculado"];
        }

        // 2. Crear registro en historial laboral
        const nuevoHistorial = new HistorialLaboral();
        nuevoHistorial.trabajador = trabajador;
        nuevoHistorial.cargo = fichaEmpresa.cargo;
        nuevoHistorial.area = fichaEmpresa.area;
        nuevoHistorial.tipoContrato = fichaEmpresa.tipoContrato;
        nuevoHistorial.sueldoBase = fichaEmpresa.sueldoBase;
        nuevoHistorial.fechaInicio = datos.fechaInicio;
        nuevoHistorial.registradoPor = datos.registradoPor;

        // 3. Procesar según el tipo de cambio
        switch (tipo) {
            case TipoCambioLaboral.DESVINCULACION:
                fichaEmpresa.estado = EstadoLaboral.DESVINCULADO;
                fichaEmpresa.fechaFinContrato = datos.fechaInicio;
                nuevoHistorial.fechaFin = datos.fechaInicio;
                nuevoHistorial.motivoTermino = datos.motivo;
                trabajador.enSistema = false;
                break;

            case TipoCambioLaboral.CAMBIO_CARGO:
                if (!datos.cargo) {
                    await queryRunner.release();
                    return [null, "El cargo es requerido para este tipo de cambio"];
                }
                fichaEmpresa.cargo = datos.cargo;
                nuevoHistorial.motivoTermino = datos.motivo;
                break;

            case TipoCambioLaboral.CAMBIO_AREA:
                if (!datos.area) {
                    await queryRunner.release();
                    return [null, "El área es requerida para este tipo de cambio"];
                }
                fichaEmpresa.area = datos.area;
                nuevoHistorial.motivoTermino = datos.motivo;
                break;

            case TipoCambioLaboral.CAMBIO_CONTRATO:
                if (!datos.tipoContrato) {
                    await queryRunner.release();
                    return [null, "El tipo de contrato es requerido para este tipo de cambio"];
                }
                fichaEmpresa.tipoContrato = datos.tipoContrato;
                nuevoHistorial.motivoTermino = datos.motivo;
                break;

            case TipoCambioLaboral.CAMBIO_SUELDO:
                if (!datos.sueldoBase || datos.sueldoBase <= 0) {
                    await queryRunner.release();
                    return [null, "El sueldo base es requerido y debe ser mayor a cero"];
                }
                if (datos.sueldoBase < fichaEmpresa.sueldoBase) {
                    await queryRunner.release();
                    return [null, "El nuevo sueldo no puede ser menor al actual"];
                }
                fichaEmpresa.sueldoBase = datos.sueldoBase;
                nuevoHistorial.motivoTermino = datos.motivo;
                break;

            case TipoCambioLaboral.CAMBIO_JORNADA:
                if (!datos.jornadaLaboral) {
                    await queryRunner.release();
                    return [null, "La jornada laboral es requerida para este tipo de cambio"];
                }
                fichaEmpresa.jornadaLaboral = datos.jornadaLaboral;
                nuevoHistorial.motivoTermino = datos.motivo;
                break;

            default:
                await queryRunner.release();
                return [null, "Tipo de cambio no válido"];
        }

        // 4. Guardar los cambios
        await queryRunner.manager.save(HistorialLaboral, nuevoHistorial);
        await queryRunner.manager.save(FichaEmpresa, fichaEmpresa);
        await queryRunner.manager.save(Trabajador, trabajador);

        await queryRunner.commitTransaction();

        const respuesta: RespuestaCambioLaboral = {
            exitoso: true,
            mensaje: `Cambio de ${tipo} procesado exitosamente`,
            cambiosRealizados: {
                fichaEmpresa: true,
                historialLaboral: true,
                trabajador: tipo === TipoCambioLaboral.DESVINCULACION
            }
        };

        return [respuesta, null];
    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("Error en procesarCambioLaboralService:", error);
        return [null, "Error interno del servidor"];
    } finally {
        await queryRunner.release();
    }
} 