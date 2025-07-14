export interface MaintenanceSparePart {
  id: number;
  repuesto: {
    id: number;
    name: string;
  };
  cantidad: number;
  maintenanceRecordId: number;
}

export interface CreateMaintenanceSparePartData {
  repuestoId: number;
  cantidad: number;
  maintenanceRecordId: number;
}

export interface UpdateMaintenanceSparePartData {
  cantidad?: number;
}
