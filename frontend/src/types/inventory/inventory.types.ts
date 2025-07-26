import { ProductType } from "./product.types";

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

export interface InventoryExitDetailData {
  productId: number
  quantity: number
}

export interface CreateInventoryExitData {
  customerRut: string
  details: InventoryExitDetailData[]
}

export interface InventoryExit {
  id: number
  exitDate?: string
  customer: {
    id: number
    name: string
    rut: string
    address: string
    phone: string
    email: string
  }
  details: {
    id: number
    product: {

      id: number
      product: string
      salePrice: number
      isActive: boolean 
    }
    quantity: number
    salePrice: number 
    totalPrice: number
  }[]
}

export interface InventoryItem {
  id: number;
  product: {
    id: number;
    product: ProductType;
    salePrice: number;
  };
  quantity: number;
}

export type MovementDetail = {
  id: number
  product: {
    id: number
    product: string
    salePrice: number
  }
  quantity: number
  purchasePrice?: number
  salePrice?: number
  totalPrice: number
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}