export interface Bono {
    id: number;
    nombreBono: string;
    monto: string;
    tipoBono: "estatal" | "empresarial";
    temporalidad: "permanente" | "recurrente" | "puntual";
    descripcion?: string;
    imponible: boolean;
    fechaCreacion: string; // Formato YYYY-MM-DD
    duracionMes?: string;
    enSistema: boolean; // Indica si el bono está activo o no
}

export interface CreateBonoData {
    nombreBono: string;
    monto: string;
    tipoBono: string;
    temporalidad: string;
    descripcion?: string;
    imponible: boolean;
    duracionMes?: string;
    fechaCreacion?: string; // Formato YYYY-MM-DD
}

export interface UpdateBonoData {
    nombreBono?: string;
    monto?: string;
    tipoBono?: "estatal" | "empresarial";
    temporalidad?: "permanente" | "recurrente" | "puntual";
    descripcion?: string;
    imponible?: boolean;
    duracionMes?: string;
}

export interface BonoSearchQueryData {
    nombreBono?: string;
    tipoBono?: "estatal" | "empresarial";
    temporalidad?: "permanente" | "recurrente" | "puntual";
    imponible?: boolean;
    duracionMes?: string;
    incluirInactivos?: string; // 'true' o 'false'
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

// Resultado de operaciones
export interface BonoOperationResult {
  success: boolean;
  data?: Bono;
  error?: string;
  errors?: Record<string, string>;
}
