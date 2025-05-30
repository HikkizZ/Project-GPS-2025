// Interface principal de Trabajador
export interface Trabajador {
  id: number;
  rut: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: Date | string;
  telefono: string;
  correo: string;
  numeroEmergencia?: string;
  direccion: string;
  fechaIngreso: Date | string;
  enSistema: boolean;
  fechaRegistro: Date | string;
  
  // Relaciones
  fichaEmpresa?: {
    id: number;
    cargo: string;
    area: string;
    empresa: string;
    tipoContrato: string;
    sueldoBase: number;
    estado: string;
  };
}

// Datos para crear trabajador
export interface CreateTrabajadorData {
  rut: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
  telefono: string;
  correo: string;
  numeroEmergencia?: string;
  direccion: string;
  fechaIngreso: string;
}

// Datos para actualizar trabajador
export interface UpdateTrabajadorData extends Partial<CreateTrabajadorData> {}

// Parámetros de búsqueda de trabajadores
export interface TrabajadorSearchParams {
  rut?: string;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  correo?: string;
  telefono?: string;
  todos?: boolean;
}

// Response paginado (si se implementa en el futuro)
export interface PaginatedTrabajadores {
  data: Trabajador[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 