export interface Supplier {
  id: number;
  name: string;
  rut: string;
  address: string;
  phone: string;
  email: string;
}

export interface CreateSupplierData {
  name: string;
  rut: string;
  address: string;
  phone: string;
  email: string;
}

export type UpdateSupplierData = Partial<CreateSupplierData>;

export interface SupplierSearchQuery {
  rut?: string;
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface PaginatedSuppliers {
  data: Supplier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}
