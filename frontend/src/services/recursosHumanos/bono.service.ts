import { apiClient } from '@/config/api.config';

import type {
    BonoSearchQueryData,
    CreateBonoData,
    UpdateBonoData,
    BonoResponseData,
    BonoSearchParamsData,
    Bono,
    BonoOperationResult
} from '../../types/recursosHumanos/bono.types'; 

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export class BonoService {
    
    
    private baseURL = '/bonos';

    private getHeaders() {
        const token = localStorage.getItem('auth_token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    

    //Funciones para usuarios admin
    
    async getAllBonos(): Promise<ApiResponse<Bono[]>> {
        try {
            // Usar fetch directamente para obtener la respuesta completa
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}${this.baseURL}/`, {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
            
            // Verificar si la respuesta es JSON válida
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            return {
                success: false,
                message: `Error del servidor: ${response.status} ${response.statusText}`
            };
            }

            const responseData = await response.json();
            console.log('URL:', `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}${this.baseURL}/`);
            console.log('Token:', localStorage.getItem('auth_token'));
            console.log('Response data:', responseData);
            if (response.ok && responseData.status === 'success') {
                return {
                success: true,
                message: responseData.message || 'Bonos obtenidos exitosamente',
                data: responseData.data || []
                };
            }

            return {
                success: false,
                message: responseData.message || 'Error al obtener bonos'
        };
        } catch (error: any) {
            console.error('Error al obtener bonos:', error);
            return {
                success: false,
                message: error.message || 'Error al obtener bonos'
            };
        }
    }


    async crearBono( bonoData: CreateBonoData ): Promise<BonoOperationResult> {

        try{
            const formData = new FormData();

            formData.append( 'nombre', bonoData.nombreBono );
            formData.append( 'monto', bonoData.monto.toString() );
            formData.append( 'tipoBono', bonoData.tipoBono );
            formData.append( 'temporalidad', bonoData.temporalidad );
            formData.append( 'descripcion', bonoData.descripcion );
            formData.append( 'imponible', bonoData.temporalidad );
            

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}${this.baseURL}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: formData
            });

            const responseData = await response.json();


            if (response.ok && responseData.status === 'success') {
                return {
                    success: true,
                    data: responseData.data
                };
            }
            
            return {
                success: false,
                error: responseData.message || 'Error al crear solicitud',
                errors: responseData.errors
            };

        } catch( error: any ){
            console.error('Error al crear solicitud:', error);
            return {
                success: false,
                error: error.message || 'Error al crear solicitud'
            };
        }
    }

    async actualizarBono( bonoId: number, bonoData: UpdateBonoData ): Promise<ApiResponse<Bono>> {
        try {

            const response = await apiClient.put<{ data: Bono }>(`${this.baseURL}/${bonoId}`, bonoData);
        
            
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

    async eliminarBono( bonoId: number ): Promise<BonoOperationResult> {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}${this.baseURL}/${bonoId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            const responseData = await response.json();
            if (response.ok && responseData.status === 'success') {
                return {
                    success: true,
                    data: responseData.data
                };
            }
            return {
                success: false,
                error: responseData.message || 'Error al eliminar bono',
                errors: responseData.errors
            };
        } catch (error: any) {
            console.error('Error al eliminar bono:', error);
            return {
                success: false,
                error: error.message || 'Error al eliminar bono'
            };
        }
    }

    async obtenerBonoPorId( bonoId: number ): Promise<BonoOperationResult> {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}${this.baseURL}/${bonoId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            const responseData = await response.json();
            if (response.ok && responseData.status === 'success') {
                return {
                    success: true,
                    data: responseData.data
                };
            }
            return {
                success: false,
                error: responseData.message || 'Error al obtener bono',
                errors: responseData.errors
            };
        } catch (error: any) {
            console.error('Error al obtener bono:', error);
            return {
                success: false,
                error: error.message || 'Error al obtener bono'
            };
        }
    }

    //Funciones para usuarios recursos humanos

}

const bonoService = new BonoService();
export default bonoService;

export const obtenerBono = (id: number) => { return bonoService.obtenerBonoPorId(id) };
export const actualizarBono = (id: number, bonoData: UpdateBonoData) => { return bonoService.actualizarBono(id, bonoData) };
