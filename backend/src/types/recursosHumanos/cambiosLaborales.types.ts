import { User } from "../../entity/user.entity.js";

export enum TipoCambioLaboral {
    DESVINCULACION = "Desvinculación",
    CAMBIO_CARGO = "Cambio de cargo",
    CAMBIO_AREA = "Cambio de área",
    CAMBIO_CONTRATO = "Cambio de contrato",
    CAMBIO_SUELDO = "Cambio de sueldo",
    CAMBIO_JORNADA = "Cambio de jornada"
}

export type DatosCambioLaboral = {
    // Campos comunes
    trabajadorId: number;
    fechaInicio: Date;
    motivo: string;
    registradoPor: User;

    // Campos específicos por tipo de cambio
    cargo?: string;
    area?: string;
    tipoContrato?: string;
    sueldoBase?: number;
    jornadaLaboral?: string;
}

export type RespuestaCambioLaboral = {
    exitoso: boolean;
    mensaje: string;
    cambiosRealizados: {
        fichaEmpresa?: boolean;
        historialLaboral?: boolean;
        trabajador?: boolean;
    };
} 