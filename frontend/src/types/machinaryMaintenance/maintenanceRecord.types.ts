import { GrupoMaquinaria } from '../maquinaria/grupoMaquinaria.types';

export interface MaintenanceRecord {
  id: number;
  descripcion: string;
  tipo: 'por_kilometraje' | 'por_rutina' | 'por_falla';
  fechaEntrada: string;
  fechaSalida: string;
  estado: 'pendiente' | 'en_proceso' | 'completado';
  maquina: {
    id: number;
    patente: string;
    modelo: string;
    grupo: GrupoMaquinaria;
  };
  mecanico: {
    id: number;
    nombre: string;
    rut: string;
  };
  repuestosUtilizados: {
    id: number;
    nombre: string;
    cantidad: number;
  }[];
}

export interface CreateMaintenanceRecordData {
  descripcion: string;
  tipo: 'por_kilometraje' | 'por_rutina' | 'por_falla';
  fechaEntrada: string;
  fechaSalida?: string;
  estado: 'pendiente' | 'en_proceso' | 'completado';
  maquinariaId: number;
  mecanicoId: number;
  repuestos: {
    repuestoId: number;
    cantidad: number;
  }[];
}

export interface UpdateMaintenanceRecordData {
  descripcion?: string;
  tipo?: 'por_kilometraje' | 'por_rutina' | 'por_falla';
  fechaEntrada?: string;
  fechaSalida?: string;
  estado?: 'pendiente' | 'en_proceso' | 'completado';
  maquinariaId?: number;
  mecanicoId?: number;
  repuestos?: {
    repuestoId: number;
    cantidad: number;
  }[];
}
