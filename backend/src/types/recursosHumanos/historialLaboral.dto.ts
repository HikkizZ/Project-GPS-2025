import { User } from "../../entity/user.entity.js";

export type CreateHistorialLaboralDTO = {
    trabajadorId: number;
    cargo: string;
    area: string;
    tipoContrato: string;
    sueldoBase: number;
    fechaInicio: string;
    fechaFin?: string;
    motivoTermino?: string;
    contratoURL?: string;
    registradoPor: User;
};

export type UpdateHistorialLaboralDTO = {
    fechaFin: string;
    motivoTermino: string;
}; 