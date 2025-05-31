// Enum para el estado laboral
export enum EstadoLaboral {
  ACTIVO = 'Activo',
  LICENCIA = 'Licencia', 
  PERMISO = 'Permiso administrativo',
  DESVINCULADO = 'Desvinculado'
}

// Interface principal de FichaEmpresa
export interface FichaEmpresa {
  id: number;
  trabajadorId: number;
  cargoId: number;
  areaId: number;
  fechaIngreso: string;
  fechaFinContrato?: string;
  tipoContrato: string;
  salario: number;
  estadoLaboral: EstadoLaboral;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relaciones
  trabajador?: {
    id: number;
    rut: string;
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string;
  };
  cargo?: {
    id: number;
    nombre: string;
    descripcion: string;
  };
  area?: {
    id: number;
    nombre: string;
    descripcion: string;
  };
}

// Parámetros de búsqueda
export interface FichaEmpresaSearchParams {
  rut?: string;
  nombres?: string;
  apellidos?: string;
  cargoId?: number;
  areaId?: number;
  estadoLaboral?: EstadoLaboral;
  fechaIngresoDesde?: string;
  fechaIngresoHasta?: string;
  page?: number;
  limit?: number;
}

// Response paginado
export interface PaginatedFichasEmpresa {
  data: FichaEmpresa[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Datos para crear/actualizar
export interface CreateFichaEmpresaData {
  trabajadorId: number;
  cargoId: number;
  areaId: number;
  fechaIngreso: string;
  fechaFinContrato?: string;
  tipoContrato: string;
  salario: number;
  estadoLaboral: EstadoLaboral;
  observaciones?: string;
}

export interface UpdateFichaEmpresaData extends Partial<CreateFichaEmpresaData> {}

// Para selects/dropdowns
export interface SelectOption {
  value: number | string;
  label: string;
} 