export interface HistorialLaboral {
  id: number;
  cargo: string;
  area: string;
  tipoContrato: string;
  jornadaLaboral: string;
  sueldoBase: number;
  fechaInicio: string;
  fechaFin?: string | null;
  motivoDesvinculacion?: string | null;
  observaciones?: string | null;
  contratoURL?: string | null;
  afp?: string | null;
  previsionSalud?: string | null;
  seguroCesantia?: boolean | null;
  estado?: string | null;
  fechaInicioLicencia?: string | null;
  fechaFinLicencia?: string | null;
  motivoLicencia?: string | null;
  trabajador?: {
    id: number;
    rut: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    correoPersonal?: string;
    fechaIngreso?: string;
    usuario?: {
      id: number;
      name: string;
      corporateEmail: string;
      role: string;
      rut: string;
      estadoCuenta: string;
    } | null;
  } | null;
  registradoPor?: {
    id: number;
    name: string;
    corporateEmail: string;
    role: string;
    rut: string;
    estadoCuenta: string;
  } | null;
  createAt?: string;
  updateAt?: string;
} 