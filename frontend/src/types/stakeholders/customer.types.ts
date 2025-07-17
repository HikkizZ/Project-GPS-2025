export interface Customer {
    id: number;
    name: string;
    rut: string;
    address: string;
    phone: string;
    email: string;
}

export interface CreateCustomerData {
    name: string;
    rut: string;
    address: string;
    phone: string;
    email: string;
}

export interface UpdateCustomerData {
    name?: string;
    rut?: string;
    address?: string;
    phone?: string;
    email?: string;
}

export interface CustomerSearchQuery {
    rut?: string;
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
}

export interface CustomerListResponse {
    status: 'success' | 'error';
    message?: string;
    data?: Customer | Customer[];
    advertencias?: string[];
}

export interface PaginatedCustomers {
    data: Customer[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}