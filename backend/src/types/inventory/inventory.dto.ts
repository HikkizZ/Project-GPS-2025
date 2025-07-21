/* Inventory entry DTOs */
/* Header-level data for inventory entry */
export type CreateInventoryEntryDTO = {
  supplierRut: string;
  entryDate?: string;
  details: InventoryEntryDetailDTO[];
};

/* Detail-level data for each product in the entry */
export type InventoryEntryDetailDTO = {
  productId: number;
  quantity: number;
  purchasePrice: number;
};

/* Inventory exit DTOs */
/* Header-level data for inventory exit */
export type CreateInventoryExitDTO = {
  customerRut: string;
  details: InventoryExitDetailDTO[];
};

/* Detail-level data for each product in the exit */
export type InventoryExitDetailDTO = {
  productId: number;
  quantity: number;
};