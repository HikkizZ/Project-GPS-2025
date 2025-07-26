export type CreateMaintenanceSparePartDTO = {
  repuestoId: number;
  mantencionId: number;
  cantidadUtilizada: number;
};

export type UpdateMaintenanceSparePartDTO = Partial<CreateMaintenanceSparePartDTO>;
