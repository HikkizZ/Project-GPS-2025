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
    numeroEmergencia?: string;
    direccion?: string;
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
  fechaInicioLicenciaPermiso?: Date | string | null;
  fechaFinLicenciaPermiso?: Date | string | null;
  motivoLicenciaPermiso?: string | null;
  contratoURL?: string | null;
  afp?: string | null; // Aseguradora de Fondos de Pensiones
  previsionSalud?: string | null; // Institución de Salud Previsional
  seguroCesantia?: string; // Seguro de Cesantía
  asignacionesBonos: {
    id: number;
    fechaAsignacion: Date | string;
    fechaFinAsignacion?: Date | string | null;
    activo: boolean;
    bono: {
      id: number;
      nombre: string;
      monto: number;
      tipo: string; // Puede ser 'empresarial' o 'estatal'
      imponible: boolean;
    };
  }[];
}

export interface AsignacionesBonos {
  fechaAsignacion: Date | string;
  fechaFinAsignacion?: Date | string | null;
  activo: boolean;
  bono: string; // Bono que se asigna, puede ser un ID o un nombre
  fichaEmpresa: FichaEmpresa;
  observaciones?: string; // Observaciones sobre la asignación
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
  afp?: string;
  previsionSalud?: string;
  seguroCesantia?: string;
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
  afp?: string;
  previsionSalud?: string;
  seguroCesantia?: string;
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
  afp?: string;
  previsionSalud?: string;
  seguroCesantia?: string;
} 

 export interface AsignarBonoDTO {
    bono: string; // ID del bono
    fechaAsignacion?: string;
    fechaFinAsignacion?: string;
    observaciones?: string;
}
export interface AsignarFichaEmpresaData {
  asignacionesBonos: number[]; // IDs de los bonos a asignar
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
    fechaEntrega: Date;
    activo: boolean;
    observaciones?: string;
}