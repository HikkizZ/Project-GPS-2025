import { FichaEmpresa } from './fichaEmpresa.types';
import { LicenciaPermiso } from './licenciaPermiso.types';

export enum EstadoTrabajador {
  ACTIVO = "ACTIVO",
  INACTIVO = "INACTIVO",
  DESPEDIDO = "DESPEDIDO",
  RENUNCIADO = "RENUNCIADO"
}

export interface HistorialLaboral {
  id: number;
  cargo: string;
  area: string;
  tipoContrato: string;
  sueldoBase: number;
  fechaInicio: string | Date;
  fechaFin?: string | Date;
  motivoTermino?: string;
  contratoURL?: string;
  fechaRegistro: string | Date;
}

// LicenciaPermiso se define en licenciaPermiso.types.ts

export interface Trabajador {
  id: number;
  rut: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string | Date;
  telefono: string;
  correoPersonal: string;
  correo?: string; // Alias para correoPersonal (para compatibilidad)
  numeroEmergencia?: string;
  direccion: string;
  fechaIngreso: string | Date;
  enSistema: boolean;
  fechaRegistro: string | Date;
  fichaEmpresa?: FichaEmpresa;
  historialLaboral?: HistorialLaboral[];
  licenciasPermisos?: LicenciaPermiso[];
  usuario?: {
    id: number;
    corporateEmail: string;
    role: string;
  };
}

export interface CreateTrabajadorData {
  rut: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento?: string;
  telefono: string;
  correoPersonal: string;
  numeroEmergencia?: string;
  direccion: string;
  fechaIngreso: string;
}

export interface UpdateTrabajadorData {
  rut?: string;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  fechaNacimiento?: string;
  telefono?: string;
  correoPersonal?: string;
  numeroEmergencia?: string;
  direccion?: string;
  fechaIngreso?: string;
}

export interface TrabajadorSearchQuery {
  rut?: string;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  fechaNacimiento?: string;
  telefono?: string;
  correoPersonal?: string;
  correo?: string; // Agregado para compatibilidad
  numeroEmergencia?: string;
  direccion?: string;
  fechaIngreso?: string;
  todos?: boolean;
  enSistema?: boolean;
}

export interface TrabajadorResponse {
  status: 'success' | 'error';
  message?: string;
  data?: Trabajador | Trabajador[];
  advertencias?: string[];
}

export interface PaginatedTrabajadores {
  data: Trabajador[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 