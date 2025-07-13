export interface CreateBonoDTO {
    nombreBono: string;
    monto: string;
    tipoBono?: "estatal" | "empresarial";
    temporalidad?: "permanente" | "recurrente" | "puntual";
    descripcion?: string;
    imponible?: boolean;
}

export interface UpdateBonoDTO {
    nombreBono?: string;
    monto?: string;
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
    monto: string;
    tipoBono: "estatal" | "empresarial";
    temporalidad: "permanente" | "recurrente" | "puntual";
    descripcion?: string;
    imponible: boolean;
    fechaCreacion: Date;
}

export interface AsignarBonoDTO {
    trabajadorId: number;
    bonoId: number;
    fechaAsignacion?: string | Date;
    activo?: boolean;
    observaciones?: string;
}

export interface UpdateAsignarBonoDTO {
    fechaAsignacion?: string | Date;
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
    fechaAsignacion: Date;
    activo: boolean;
    observaciones?: string;
}

/**
 * 
 * export interface TrabajadoresByBonoResponseDTO {
    id: number;
    rut: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    fechaNacimiento: Date;
    telefono: string;
    correo: string;
    numeroEmergencia: string;
    direccion: string;
    fechaIngreso: Date;
    enSistema: boolean;
    fichaEmpresa: any;
    historialLaboral: any[];
    licenciasPermisos: any[];
    usuario: any;
    asignaciones: AsignarBonoResponseDTO[];
    datosPrevisionales: any[];
    fechaRegistro: Date;
}
 * 
 */

export interface DetalleBonoResponseDTO {
    id: number;
    nombreBono: string;
    monto: string;
    tipoBono: "estatal" | "empresarial";
    temporalidad: "permanente" | "recurrente" | "puntual";
    descripcion?: string;
    imponible: boolean;
    fechaCreacion: Date;
    asignaciones: AsignarBonoResponseDTO[];
}