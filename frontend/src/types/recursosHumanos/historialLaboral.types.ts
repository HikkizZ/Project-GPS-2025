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

export interface HistorialUnificado {
  id: string; // Formato: "tipo-id" (ej: "laboral-123", "trabajador-456")
  tipo: 'laboral' | 'trabajador' | 'usuario';
  fecha: string;
  descripcion: string;
  detalles: {
    // Campos comunes
    historialLaboralId?: number;
    usuarioId?: number;
    licenciaId?: number;
    archivoAdjuntoURL?: string;
    
    // Campos laborales
    cargo?: string;
    area?: string;
    tipoContrato?: string;
    jornadaLaboral?: string;
    sueldoBase?: number;
    estado?: string;
    fechaInicioLicenciaPermiso?: string;
    fechaFinLicenciaPermiso?: string;
    motivoLicenciaPermiso?: string;
    motivoDesvinculacion?: string;
    observaciones?: string;
    contratoURL?: string;
    afp?: string;
    previsionSalud?: string;
    seguroCesantia?: boolean;
    
    // Campos de trabajador
    rut?: string;
    nombres?: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
    correoPersonal?: string;
    fechaIngreso?: string;
    
    // Campos de usuario
    corporateEmail?: string;
    role?: string;
    estadoCuenta?: string;
  };
  registradoPor?: {
    id: number;
    name: string;
    role: string;
  } | null;
  trabajadorId: number;
} 