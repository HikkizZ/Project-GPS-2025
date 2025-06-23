export interface CreateBonoDTO {
    nombreBono: string;
    monto: number;
    tipoBono?: "estatal" | "empresarial";
    temporalidad?: "permanente" | "recurrente" | "puntual";
    descripcion?: string;
    imponible?: boolean;
}

export interface UpdateBonoDTO {
    nombreBono?: string;
    monto?: number;
    tipoBono?: "estatal" | "empresarial";
    temporalidad?: "permanente" | "recurrente" | "puntual";
    descripcion?: string;
    imponible?: boolean;
}

export interface BonoQueryDTO {
    id?: number;
    nombreBono?: string;
    tipoBono?: "estatal" | "empresarial";
    temporalidad?: "permanente" | "recurrente" | "puntual";
    limit?: number;
    offset?: number;
    fechaCreacionDesde?: string | Date;
    fechaCreacionHasta?: string | Date;
    imponible?: boolean;
}

export interface BonoResponseDTO {
    id: number;
    nombreBono: string;
    monto: number;
    tipoBono: "estatal" | "empresarial";
    temporalidad: "permanente" | "recurrente" | "puntual";
    descripcion?: string;
    imponible: boolean;
    fechaCreacion: Date;
}

export interface AsignarBonoDTO {
    trabajadorId: number;
    bonoId: number;
    fechaEntrega?: string | Date;
    activo?: boolean;
    observaciones?: string;
}

export interface UpdateAsignarBonoDTO {
    fechaEntrega?: string | Date;
    activo?: boolean;
    observaciones?: string;
}

export interface AsignarBonoQueryDTO {
    id?: number;
    trabajadorId?: number;
    bonoId?: number;
    activo?: boolean;
    fechaEntregaDesde?: string | Date;
    fechaEntregaHasta?: string | Date;
    limit?: number;
    offset?: number;
}

export interface AsignarBonoResponseDTO {
    id: number;
    trabajador: {
        id: number;
        nombres: string;
        apellidoPaterno: string;
        apellidoMaterno: string;
        rut: string;
    };
    bono: {
        id: number;
        nombreBono: string;
        monto: number;
        tipoBono: "estatal" | "empresarial";
        temporalidad: "permanente" | "recurrente" | "puntual";
    };
    fechaEntrega: Date;
    activo: boolean;
    observaciones?: string;
}
