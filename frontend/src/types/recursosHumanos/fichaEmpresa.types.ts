export enum EstadoLaboral {
  ACTIVO = "Activo",
  LICENCIA = "Licencia médica",
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
    telefono: string;
    fechaIngreso: Date | string;
    fechaNacimiento?: Date | string;
    usuario?: {
      id: number;
      corporateEmail: string;
      role: string;
    };
  };
  cargo: string;
  area: string;
  tipoContrato: string;
  jornadaLaboral: string;
  sueldoBase: number;
  fechaInicioContrato: Date | string;
  fechaFinContrato?: Date | string | null;
  estado: EstadoLaboral;
  fechaInicioLicencia?: Date | string | null;
  fechaFinLicencia?: Date | string | null;
  motivoLicencia?: string | null;
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
  id?: number;
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