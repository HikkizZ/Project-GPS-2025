import { apiClient } from '@/config/api.config';
import { ApiResponse } from '@/types';

import type {
    BonoSearchQueryData,
    CreateBonoData,
    UpdateBonoData,
    BonoSearchParamsData,
    Bono,
    BonoOperationResult
} from '../../types/recursosHumanos/bono.types';

export class BonoService {
    private baseURL = '/bonos';
/*
    private getHeaders() {
        const token = localStorage.getItem('auth_token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }
*/
    // Funciones para usuarios administrador y superAdministrador 
    // Obtener todos los bonos o por filtros
    async getAllBonos(query: BonoSearchQueryData = {}): Promise<ApiResponse<{bonos: Bono[], total: number}>> {
        // Limpiar campos undefined antes de construir los parámetros
        const cleanQuery = Object.fromEntries(
        Object.entries(query).filter(([_, value]) => value !== undefined && value !== null && value !== '')
        );
        
        const params = new URLSearchParams(cleanQuery as any).toString();
        const url = params ? `${this.baseURL}?${params}` : this.baseURL;
        try {
            // Usar get directamente para obtener la respuesta completa
            const response = await apiClient.get<{ status: string; message: string; data: { bonos: Bono[]; total: number } }>(url);

            console.log("Obteniendo bonos con query:", cleanQuery);
            console.log('URL:', `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}${url}`);
            console.log('Token:', localStorage.getItem('auth_token'));
            return {
                success: true,
                data: response.data,
                message: 'Bonos obtenidos exitosamente',
            };
            
        } catch (error: any) {
            console.error('Error al obtener bonos:', error);
            return {
                success: false,
                message: error.message || 'Error al obtener bonos'
            };
        }
    }

    // Crear nuevo bono - solo permitido para usuarios Administrador y SuperAdministrador
    async crearBono( bonoData: CreateBonoData ): Promise<any> {

        try{
            const formData = new FormData();

            formData.append( 'nombre', bonoData.nombreBono );
            formData.append( 'monto', bonoData.monto.toString() );
            formData.append( 'tipoBono', bonoData.tipoBono );
            formData.append( 'temporalidad', bonoData.temporalidad );
            formData.append( 'descripcion', bonoData.descripcion );
            formData.append( 'imponible', bonoData.temporalidad );
            
            const response = await apiClient.post(`${this.baseURL}/`, bonoData);

            const responseData = await response.json();
            
            console.log("Creando bono con datos:", bonoData);
            console.log('URL:', `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}${this.baseURL}/`);
            console.log('Token:', localStorage.getItem('auth_token'));
            console.log('Response data:', responseData);

            if (response.ok && responseData.status === 'success') {
                return {
                    success: true,
                    data: responseData.data
                };
            }
            
            return {
                success: false,
                error: responseData.message || 'Error al crear bono',
                errors: responseData.errors
            };

        } catch( error: any ){
            console.error('Error al crear bono:', error);
            return {
                success: false,
                error: error.message || 'Error al crear solicitud'
            };
        }
    }

    async actualizarBono( bonoId: number, bonoData: UpdateBonoData ): Promise<ApiResponse<Bono>> {
        try {

            const response = await apiClient.put<{ data: Bono }>(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}${this.baseURL}/${bonoId}`, bonoData);
            console.log("Actualizando bono con ID:", bonoId);
            console.log('URL:', `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}${this.baseURL}/${bonoId}`);
            console.log('Token:', localStorage.getItem('auth_token'));
            console.log('Response data:', response.data);
            return {
                success: true,
                message: 'Bono actualizado exitosamente',
                data: response.data
            };

        } catch (error: any) {
            console.error('Error al actualizar bono:', error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Error al actualizar bono'
            };
        }
    }

    async eliminarBono( bonoId: number ): Promise<ApiResponse> {
        try {
            const response = await apiClient.delete<{ data: Bono }>(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}${this.baseURL}/${bonoId}`);
            
            return {
                success: true,
                message: 'Bono eliminado exitosamente'
            };
        } catch (error: any) {
            console.error('Error al eliminar bono:', error);
            return {
                success: false,
                error: error.message || 'Error al eliminar bono',
                message: error.response?.data?.message || 'Error al eliminar bono'
            };
        }
    }

    async obtenerBonoPorId(bonoId: number): Promise<BonoOperationResult> {
        try {
            const response = await apiClient.get<{ data: Bono; message: string }>(`${this.baseURL}/${bonoId}`);

            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            console.error('Error al obtener bono:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Error al obtener bono'
            };
        }
    }
}

export const bonoService = new BonoService();
export const actualizarBono = (id: number, data: UpdateBonoData) => bonoService.actualizarBono(id, data);
export const crearBono = (data: CreateBonoData) => bonoService.crearBono(data);
