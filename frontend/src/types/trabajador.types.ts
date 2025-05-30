export enum EstadoLaboral {
  ACTIVO = "ACTIVO",
  INACTIVO = "INACTIVO",
  DESPEDIDO = "DESPEDIDO",
  RENUNCIADO = "RENUNCIADO"
}

export interface FichaEmpresa {
  id: number;
  cargo: string;
  area: string;
  empresa?: string;
  tipoContrato: string;
  jornadaLaboral?: string;
  sueldoBase: number;
  fechaInicioContrato: string;
  fechaFinContrato?: string;
  estado: EstadoLaboral;
  contratoURL?: string;
}

export interface HistorialLaboral {
  id: number;
  cargo: string;
  area: string;
  tipoContrato: string;
  sueldoBase: number;
  fechaInicio: string;
  fechaFin?: string;
  motivoTermino?: string;
  contratoURL?: string;
  fechaRegistro: string;
}

export interface LicenciaPermiso {
  id: number;
  tipo: string;
  fechaInicio: string;
  fechaFin: string;
  motivo: string;
  estado: string;
}

export interface Capacitacion {
  id: number;
  nombre: string;
  institucion: string;
  fechaInicio: string;
  fechaFin?: string;
  certificadoURL?: string;
}

export interface Trabajador {
  id: number;
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
  enSistema: boolean;
  fechaRegistro: string;
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
  correo: string;
  numeroEmergencia?: string;
  direccion: string;
  fechaIngreso: string;
  fichaEmpresa?: Partial<FichaEmpresa>;
}

export interface TrabajadorSearchQuery {
  rut?: string;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  correo?: string;
  telefono?: string;
  todos?: boolean;
}

export interface TrabajadorResponse {
  status: 'success' | 'error';
  message: string;
  data?: Trabajador | Trabajador[];
} 