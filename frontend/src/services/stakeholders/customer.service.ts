import { apiClient } from "@/config/api.config";
import { ApiResponse } from "@/types";
import { Supplier, CreateSupplierData, UpdateSupplierData, SupplierSearchQuery } from "@/types/stakeholders/supplier.types";

export class SupplierService {
    private baseURL = '/suppliers';

    //? Obtener todos los proveedores o buscar con filtros
    async getSuppliers(query: SupplierSearchQuery = {}): Promise<ApiResponse<Supplier[]>> {
        // Limpiar campos undefined antes de construir los parámetros
        const cleanQuery = Object.fromEntries(
            Object.entries(query).filter(([_, value]) => value !== undefined && value !== null && value !== '')
        );

        const params = new URLSearchParams(cleanQuery as any).toString();
        const url = params ? `${this.baseURL}?${params}` : this.baseURL;

        try {
            const response = await apiClient.get<{ data: Supplier[]; message: string }>(url);
            return {
                success: true,
                data: response.data,
                message: response.message || 'Proveedores obtenidos exitosamente',
            };
        } catch (error) {
            throw error;
        }
    }

    //? Crear nuevo proveedor
    async createSupplier(supplierData: CreateSupplierData): Promise<ApiResponse<Supplier>> {
        const response = await apiClient.post<{ data: Supplier; message: string }>(`${this.baseURL}/`, supplierData);
        return {
            success: true,
            data: response.data,
            message: response.message || 'Proveedor creado exitosamente',
        };
    }

    //? Actualizar proveedor
    async updateSupplier(id: number, supplierData: UpdateSupplierData): Promise<ApiResponse<Supplier>> {
        const response = await apiClient.put<{ data: Supplier; message: string }>(`${this.baseURL}/${id}`, supplierData);
        return {
            success: true,
            data: response.data,
            message: response.message || 'Proveedor actualizado exitosamente',
        };
    }

    //? Eliminar proveedor (soft delete)
    async deleteSupplier(id: number): Promise<ApiResponse<void>> {
        const response = await apiClient.delete<{ message: string }>(`${this.baseURL}/${id}`);
        return {
            success: true,
            message: response.message || 'Proveedor eliminado exitosamente',
        };
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

    static formatPhone(phone: string): string {
        // Agregar +56 si no tiene código de país
        if (!phone.startsWith('+')) {
            if (phone.startsWith('9')) {
                return `+56${phone}`;
            }
            return `+56${phone}`;
        }
        return phone;
    }
}

export const supplierService = new SupplierService();