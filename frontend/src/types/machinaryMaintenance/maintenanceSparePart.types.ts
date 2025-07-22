export interface MaintenanceSparePart {
  id: number;
  repuesto: {
    id: number;
    name: string;
  };
  cantidadUtilizada: number;
  mantencion: {
    id: number;
    maquinaria?: {
      patente: string;
      modelo: string;
      grupo: string;
    };
    mecanicoAsignado?: {
      rut: string;
      trabajador?: {
        nombres: string;
        apellidoPaterno: string;
        apellidoMaterno: string;
      };
    };
  };
}


export interface CreateMaintenanceSparePartData {
  repuestoId: number;
  mantencionId: number;
  cantidadUtilizada: number;
}

export interface UpdateMaintenanceSparePartData {
  cantidadUtilizada?: number;
}
