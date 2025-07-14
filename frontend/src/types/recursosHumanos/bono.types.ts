export interface Bono {
    id: number;
    nombreBono: string;
    monto: string;
    tipoBono: "estatal" | "empresarial";
    temporalidad: "permanente" | "recurrente" | "puntual";
    descripcion?: string;
    imponible: boolean;
    fechaCreacion: Date;
}

export interface CreateBonoData {
    nombreBono: string;
    monto: string;
    tipoBono?: "estatal" | "empresarial";
    temporalidad?: "permanente" | "recurrente" | "puntual";
    descripcion?: string;
    imponible?: boolean;
}

export interface UpdateBonoData {
    nombreBono?: string;
    monto?: string;
    tipoBono?: "estatal" | "empresarial";
    temporalidad?: "permanente" | "recurrente" | "puntual";
    descripcion?: string;
    imponible?: boolean;
}

export interface BonoSearchQueryData {
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

export interface BonoSearchParamsData {
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

export interface BonoResponseData {
    id: number;
    nombreBono: string;
    monto: string;
    tipoBono: "estatal" | "empresarial";
    temporalidad: "permanente" | "recurrente" | "puntual";
    descripcion?: string;
    imponible: boolean;
    fechaCreacion: Date;
}

// Resultado de operaciones
export interface BonoOperationResult {
  success: boolean;
  data?: Bono;
  error?: string;
  errors?: Record<string, string>;
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
        monto: string;
        tipoBono: "estatal" | "empresarial";
        temporalidad: "permanente" | "recurrente" | "puntual";
    };
    fechaEntrega: Date;
    activo: boolean;
    observaciones?: string;
}
