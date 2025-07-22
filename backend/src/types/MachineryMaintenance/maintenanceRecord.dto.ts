import { EstadoMantencion, RazonMantencion } from '../../entity/MachineryMaintenance/maintenanceRecord.entity.js';

export type CreateMaintenanceRecordDTO = {
  maquinariaId: number;
  razonMantencion: RazonMantencion;
  descripcionEntrada: string;
  mecanicoId: number;
  repuestosUtilizados: {
    repuestoId: number;
    cantidad: number;
  }[];
};

export type UpdateMaintenanceRecordDTO = {
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
};
