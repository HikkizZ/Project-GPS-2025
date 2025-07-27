export enum EstadoMantencion {
  PENDIENTE = 'pendiente',
  EN_PROCESO = 'en_proceso',
  COMPLETADA = 'completada',
  IRRECUPERABLE = 'irrecuperable',
}

export enum RazonMantencion {
  KILOMETRAJE = 'kilometraje',
  RUTINA = 'rutina',
  FALLA = 'falla',
}

export interface MaintenanceRecord {
  id: number;
  razonMantencion: RazonMantencion;
  descripcionEntrada: string;
  descripcionSalida?: string;
  fechaEntrada: Date; 
  fechaSalida?: Date;
  estado: EstadoMantencion;

  maquinaria: {
    id: number;
    patente: string;
    modelo: string;
    grupo: string;
    numeroChasis: string;
  };

  mecanicoAsignado: {
    id: number;
    rut: string;
    trabajador?: {
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  };
  };

  repuestosUtilizados: {
    id: number;
    nombre: string;
    cantidad: number;
  }[];
}

export interface CreateMaintenanceRecordData {
  maquinariaId: number;
  razonMantencion: RazonMantencion;
  descripcionEntrada: string;
  repuestosUtilizados: {
    repuestoId: number;
    cantidad: number;
  }[];
}

export interface UpdateMaintenanceRecordData {
  maquinariaId?: number;
  razonMantencion?: RazonMantencion;
  descripcionEntrada?: string;
  mecanicoId?: number;
  estado?: EstadoMantencion;
  fechaSalida?: string;
  descripcionSalida?: string;
  repuestosUtilizados?: {
    repuestoId: number;
    cantidad: number;
  }[];
}

export interface PaginatedMaintenanceRecords {
  data: MaintenanceRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
