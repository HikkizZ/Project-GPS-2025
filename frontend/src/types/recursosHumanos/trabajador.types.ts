import { FichaEmpresa } from './fichaEmpresa.types';

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

export interface LicenciaPermiso {
  id: number;
  tipo: string;
  fechaInicio: string | Date;
  fechaFin: string | Date;
  motivo: string;
  estado: string;
}

export interface Capacitacion {
  id: number;
  nombre: string;
  institucion: string;
  fechaInicio: string | Date;
  fechaFin?: string | Date;
  certificadoURL?: string;
}

export interface Trabajador {
  id: number;
  rut: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string | Date;
  telefono: string;
  correoPersonal: string;
  numeroEmergencia?: string;
  direccion: string;
  fechaIngreso: string | Date;
  enSistema: boolean;
  fechaRegistro: string | Date;
  fichaEmpresa?: FichaEmpresa;
  historialLaboral?: HistorialLaboral[];
  licenciasPermisos?: LicenciaPermiso[];
  capacitaciones?: Capacitacion[];
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

export interface UpdateTrabajadorData extends Partial<CreateTrabajadorData> {}

export interface TrabajadorSearchQuery {
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
  todos?: boolean;
  soloEliminados?: boolean;
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