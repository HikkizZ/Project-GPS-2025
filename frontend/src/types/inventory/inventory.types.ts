export interface InventoryEntryDetailData {
  productId: number;
  quantity: number;
  purchasePrice: number;
}

export interface CreateInventoryEntryData {
  supplierRut: string;
  details: InventoryEntryDetailData[];
}

export interface InventoryEntry {
  id: number;
  entryDate?: string;
  supplier: {
    rut: string;
    name: string;
  };
  details: {
    id: number;
    product: {
      id: number;
      product: string;
      salePrice: number;
    };
    quantity: number;
    purchasePrice: number;
    totalPrice: number;
  }[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}