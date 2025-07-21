import { apiClient } from "@/config/api.config";
import { ApiResponse } from "@/types";
import { Customer, CreateCustomerData, UpdateCustomerData, CustomerSearchQuery } from "@/types/stakeholders/customer.types";

export class CustomerService {
    private baseURL = '/customers';

    //? Obtener todos los clientes o buscar con filtros
    async getCustomers(): Promise<ApiResponse<Customer[]>> {
        try {
            const response = await apiClient.get<{ data: Customer[]; message: string }>(`${this.baseURL}/all`);

            return {
                success: true,
                data: response.data,
                message: response.message || 'Clientes obtenidos exitosamente',
            };
        } catch (error) {
            throw error;
        }
    }

    //? Buscar cliente por RUT o email
    async searchCustomer(query: CustomerSearchQuery): Promise<ApiResponse<Customer>> {
        const cleanQuery = Object.fromEntries(
            Object.entries(query).filter(([_, value]) => value !== undefined && value !== null && value !== '')
        );
        const params = new URLSearchParams(cleanQuery as any).toString();
        const url = `${this.baseURL}?${params}`;

        try {
            const response = await apiClient.get<{ data: Customer; message: string }>(url);

            return {
                success: true,
                data: response.data,
                message: response.message || 'Cliente encontrado',
            };
        } catch (error) {
            throw error;
        }
    }

    //? Crear nuevo cliente
    async createCustomer(customerData: CreateCustomerData): Promise<ApiResponse<Customer>> {
        try {
            if (!customerData.phone.startsWith('+')) {
                if (customerData.phone.startsWith('9')) {
                    customerData.phone = `+56${customerData.phone}`;
                } else {
                    customerData.phone = `+56${customerData.phone}`;
                }
            }

            const response = await apiClient.post<{ data: Customer; message: string }>(`${this.baseURL}/`, customerData);

            return {
                success: true,
                data: response.data,
                message: response.message || 'Cliente creado exitosamente',
            };
        } catch (error) {
            throw error;
        }
    }

    //? Actualizar cliente
    async updateCustomer(id: number, customerData: UpdateCustomerData): Promise<ApiResponse<Customer>> {
        try {
            if (!customerData.phone.startsWith('+')) {
                if (customerData.phone.startsWith('9')) {
                    customerData.phone = `+56${customerData.phone}`;
                } else {
                    customerData.phone = `+56${customerData.phone}`;
                }
            }

            const response = await apiClient.put<{ data: Customer; message: string }>(`${this.baseURL}/${id}`, customerData);
            
            return {
                success: true,
                data: response.data,
                message: response.message || 'Cliente actualizado exitosamente',
            };
        } catch (error) {
            throw error;
        }
    }

    //? Eliminar cliente (soft delete)
    async deleteCustomer(id: number): Promise<ApiResponse<void>> {
        try {
            const response = await apiClient.delete<{ message: string }>(`${this.baseURL}/${id}`);
            
            return {
                success: true,
                message: response.message || 'Cliente eliminado exitosamente',
            };
        } catch (error) {
            throw error;
        }
    }

    //* Utilidades estáticas
    static formatRUT(rut: string): string {
        // Eliminar caracteres no válidos
        rut = rut.replace(/[^0-9kK-]/g, '');

        // Si el RUT está vacío, retornar
        if (!rut) return '';

        // Separar número y dígito verificador
        let numero = rut;
        let dv = '';

        if (rut.includes('-')) {
            [numero, dv] = rut.split('-');
        } else {
            dv = numero.slice(-1);
            numero = numero.slice(0, -1);
        }

        // Formatear número con puntos
        numero = numero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        return numero + '-' + dv;
    }

    static validateRUT(rut: string): boolean {
        // Remover puntos y guiones
        const cleanRut = rut.replace(/[.\-]/g, '');

        if (cleanRut.length < 8 || cleanRut.length > 9) return false;

        const rutNumber = cleanRut.slice(0, -1);
        const dv = cleanRut.slice(-1).toLowerCase();

        // Calcular dígito verificador
        let suma = 0;
        let multiplicador = 2;

        for (let i = rutNumber.length - 1; i >= 0; i--) {
            suma += parseInt(rutNumber[i]) * multiplicador;
            multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
        }

        const resto = suma % 11;
        const dvCalculado = resto === 0 ? '0' : resto === 1 ? 'k' : (11 - resto).toString();

        return dv === dvCalculado;
    }
}

export const customerService = new CustomerService();