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

export interface UpdateSupplierData {
    name?: string;
    rut?: string;
    address?: string;
    phone?: string;
    email?: string;
}

export interface SupplierSearchQuery {
    rut?: string;
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
}

export interface SupplierListResponse {
    status: 'success' | 'error';
    message?: string;
    data?: Supplier | Supplier[];
    advertencias?: string[];
}

export interface PaginatedSuppliers {
    data: Supplier[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}