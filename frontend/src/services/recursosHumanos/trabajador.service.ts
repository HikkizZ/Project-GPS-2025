import { apiClient } from '@/config/api.config';
import {
  Trabajador,
  CreateTrabajadorData,
  TrabajadorSearchQuery,
  TrabajadorResponse,
  UpdateTrabajadorData
} from '@/types/recursosHumanos/trabajador.types';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// Exportar la clase
export class TrabajadorService {
  private baseURL = '/trabajadores';

  private getHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Obtener todos los trabajadores
  async getAllTrabajadores(): Promise<ApiResponse<Trabajador[]>> {
    try {
      // Usar fetch directamente para obtener la respuesta completa
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}${this.baseURL}/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      // Verificar si la respuesta es JSON válida
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Respuesta no JSON recibida:', textResponse);
        return {
          success: false,
          message: `Error del servidor: ${response.status} ${response.statusText}`
        };
      }

      const responseData = await response.json();

      if (response.ok && responseData.status === 'success') {
        return {
          success: true,
          message: responseData.message || 'Trabajadores obtenidos exitosamente',
          data: responseData.data
        };
      }

      return {
        success: false,
        message: responseData.message || 'Error al obtener trabajadores'
      };
    } catch (error: any) {
      console.error('Error al obtener trabajadores:', error);
      return {
        success: false,
        message: error.message || 'Error al obtener trabajadores'
      };
    }
  }

  // Obtener trabajador por ID
  async getTrabajadorById(id: number): Promise<ApiResponse<Trabajador>> {
    try {
      const data = await apiClient.get<{ data: Trabajador }>(`${this.baseURL}/${id}`);
      return {
        success: true,
        message: 'Trabajador obtenido exitosamente',
        data: data.data
      };
    } catch (error: any) {
      console.error('Error al obtener trabajador:', error);
      return {
        success: false,
        message: error.message || 'Error al obtener trabajador'
      };
    }
  }

  // Crear nuevo trabajador
  async createTrabajador(trabajadorData: CreateTrabajadorData): Promise<any> {
    try {
      const response = await apiClient.post(`${this.baseURL}/`, trabajadorData);
      return {
        success: true,
        trabajador: response.data,
        advertencias: response.advertencias || []
      };
    } catch (error: any) {
      console.error('Error al crear trabajador:', error);
      return {
        success: false,
        error: error.message || 'Error al crear trabajador'
      };
    }
  }

  // Actualizar trabajador
  async updateTrabajador(id: number, trabajadorData: UpdateTrabajadorData): Promise<ApiResponse<Trabajador>> {
    try {
      const data = await apiClient.put<{ data: Trabajador }>(`${this.baseURL}/${id}`, trabajadorData);
      return {
        success: true,
        message: 'Trabajador actualizado exitosamente',
        data: data.data
      };
    } catch (error: any) {
      console.error('Error al actualizar trabajador:', error);
      return {
        success: false,
        message: error.message || 'Error al actualizar trabajador'
      };
    }
  }

  // Eliminar trabajador
  async deleteTrabajador(id: number): Promise<ApiResponse> {
    try {
      await apiClient.delete(`${this.baseURL}/${id}`);
      return {
        success: true,
        message: 'Trabajador eliminado exitosamente'
      };
    } catch (error: any) {
      console.error('Error al eliminar trabajador:', error);
      return {
        success: false,
        message: error.message || 'Error al eliminar trabajador'
      };
    }
  }

  // Buscar trabajadores
  async searchTrabajadores(query: any): Promise<ApiResponse<Trabajador[]>> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      // Usar fetch directamente para obtener la respuesta completa
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}${this.baseURL}/detail/?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      // Verificar si la respuesta es JSON válida
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Respuesta no JSON recibida:', textResponse);
        return {
          success: false,
          message: `Error del servidor: ${response.status} ${response.statusText}`
        };
      }

      const responseData = await response.json();

      if (response.ok && responseData.status === 'success') {
        return {
          success: true,
          message: responseData.message || 'Búsqueda completada exitosamente',
          data: responseData.data
        };
      }

      return {
        success: false,
        message: responseData.message || 'Error al buscar trabajadores'
      };
    } catch (error: any) {
      console.error('Error al buscar trabajadores:', error);
      return {
        success: false,
        message: error.message || 'Error al buscar trabajadores'
      };
    }
  }

  // Desvincular trabajador
  async desvincularTrabajador(id: number, motivo: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}${this.baseURL}/${id}/desvincular`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ motivo })
      });

      // Verificar si la respuesta es JSON válida
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Respuesta no JSON recibida:', textResponse);
        return {
          success: false,
          message: `Error del servidor: ${response.status} ${response.statusText}`
        };
      }

      const responseData = await response.json();

      if (response.ok && responseData.status === 'success') {
        return { 
          success: true, 
          message: responseData.message || 'Trabajador desvinculado exitosamente' 
        };
      }

      return { 
        success: false, 
        message: responseData.message || 'Error al desvincular trabajador' 
      };
    } catch (error: any) {
      console.error('Error al desvincular trabajador:', error);
      return { 
        success: false, 
        message: 'Error de conexión con el servidor' 
      };
    }
  }

  // Utilidades estáticas
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

  static formatFecha(fecha: string | Date): string {
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return date.toLocaleDateString('es-CL');
  }
}

// Instancia singleton del servicio
export const trabajadorService = new TrabajadorService();

// Funciones de conveniencia para uso directo
export const getAllTrabajadores = () => trabajadorService.getAllTrabajadores();
export const getTrabajadorById = (id: number) => trabajadorService.getTrabajadorById(id);
export const createTrabajador = (data: CreateTrabajadorData) => trabajadorService.createTrabajador(data);
export const updateTrabajador = (id: number, data: UpdateTrabajadorData) => trabajadorService.updateTrabajador(id, data);
export const deleteTrabajador = (id: number) => trabajadorService.deleteTrabajador(id);
export const searchTrabajadores = (query: any) => trabajadorService.searchTrabajadores(query); 