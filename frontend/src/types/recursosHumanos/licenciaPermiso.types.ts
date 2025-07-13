// Enums que coinciden con el backend
export enum TipoSolicitud {
  LICENCIA = "Licencia médica",
  PERMISO = "Permiso administrativo"
}

export enum EstadoSolicitud {
  PENDIENTE = "Pendiente",
  APROBADA = "Aprobada", 
  RECHAZADA = "Rechazada"
}

// Tipo base para una licencia/permiso
export interface LicenciaPermiso {
  id: number;
  trabajador: {
    id: number;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    rut: string;
    telefono: string;
    correoPersonal: string;
    correo?: string; // Alias para compatibilidad
    usuario?: {
      id: number;
      email: string;
      role: string;
    };
  };
  tipo: TipoSolicitud;
  fechaInicio: string; // formato YYYY-MM-DD
  fechaFin: string;    // formato YYYY-MM-DD
  motivoSolicitud: string;
  estado: EstadoSolicitud;
  respuestaEncargado?: string;
  revisadoPor?: {
    id: number;
    name: string;
    email: string;
    role: string;
    rut: string;
  };
  archivoAdjuntoURL?: string;
  fechaSolicitud: string; // timestamp ISO
}

// DTO para crear nueva solicitud
export interface CreateLicenciaPermisoDTO {
  tipo: TipoSolicitud;
  fechaInicio: string; // formato YYYY-MM-DD
  fechaFin: string;    // formato YYYY-MM-DD
  motivoSolicitud: string;
}

// DTO para actualizar solicitud (usado por RRHH)
export interface UpdateLicenciaPermisoDTO {
  estado: EstadoSolicitud;
  respuestaEncargado: string;
}

// Respuesta de la API
export interface LicenciaPermisoResponse {
  status: string;
  message: string;
  data: LicenciaPermiso;
}

export interface LicenciasPermisosListResponse {
  status: string;
  message: string;
  data: LicenciaPermiso[];
}

// Filtros para búsqueda
export interface LicenciaPermisoFilters {
  estado?: EstadoSolicitud;
  tipo?: TipoSolicitud;
  trabajadorId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}

// Para formularios
export interface CreateLicenciaPermisoForm extends CreateLicenciaPermisoDTO {
  archivo?: File;
}

// Resultado de operaciones
export interface LicenciaPermisoOperationResult {
  success: boolean;
  data?: LicenciaPermiso;
  error?: string;
  errors?: Record<string, string>;
}

export interface LicenciasPermisosOperationResult {
  success: boolean;
  data?: LicenciaPermiso[];
  error?: string;
} 