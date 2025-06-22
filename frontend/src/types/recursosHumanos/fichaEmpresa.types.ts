export enum EstadoLaboral {
  ACTIVO = "Activo",
  LICENCIA = "Licencia", 
  PERMISO = "Permiso administrativo",
  DESVINCULADO = "Desvinculado"
}

export interface FichaEmpresa {
  id: number;
  trabajador: {
    id: number;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    rut: string;
  };
  cargo: string;
  area: string;
  tipoContrato: string;
  jornadaLaboral: string;
  sueldoBase: number;
  fechaInicioContrato: Date | string;
  fechaFinContrato?: Date | string | null;
  estado: EstadoLaboral;
  contratoURL?: string | null;
}

export interface CreateFichaEmpresaData {
  trabajadorId: number;
  cargo: string;
  area: string;
  tipoContrato: string;
  jornadaLaboral: string;
  sueldoBase: number;
  fechaInicioContrato: Date | string;
  fechaFinContrato?: Date | string;
  contratoURL?: string;
}

export interface FichaEmpresaSearchQuery {
  trabajadorId?: number;
  rut?: string;
  estado?: EstadoLaboral;
  cargo?: string;
  area?: string;
  tipoContrato?: string;
  jornadaLaboral?: string;
  sueldoBaseDesde?: number;
  sueldoBaseHasta?: number;
  fechaInicioDesde?: Date | string;
  fechaInicioHasta?: Date | string;
  fechaFinDesde?: Date | string;
  fechaFinHasta?: Date | string;
}

export interface UpdateFichaEmpresaData {
  cargo?: string;
  area?: string;
  tipoContrato?: string;
  jornadaLaboral?: string;
  sueldoBase?: number | string;
  fechaInicioContrato?: string;
  fechaFinContrato?: string;
  contratoURL?: string;
}

export interface ActualizarEstadoData {
  estado: EstadoLaboral;
  motivo?: string;
}

export interface FichaEmpresaResponse {
  success: boolean;
  message: string;
  data: FichaEmpresa;
}

export interface FichaEmpresaSearchParams {
  rut?: string;
  estado?: EstadoLaboral;
  estados?: EstadoLaboral[];
  cargo?: string;
  area?: string;
  tipoContrato?: string;
  sueldoBaseDesde?: number;
  sueldoBaseHasta?: number;
  fechaInicioDesde?: string;
  fechaInicioHasta?: string;
  fechaFinDesde?: string;
  fechaFinHasta?: string;
  incluirSinFechaFin?: boolean;
} 