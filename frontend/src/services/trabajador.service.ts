import axios from 'axios';
import { API_CONFIG, getAuthHeaders } from '@/config/api.config';
import { authService } from './auth.service';
import {
  Trabajador,
  CreateTrabajadorData,
  TrabajadorSearchQuery,
  TrabajadorResponse
} from '@/types/trabajador.types';

class TrabajadorService {
  private baseURL = API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.TRABAJADORES.BASE;

  // Obtener headers con autenticación
  private getHeaders() {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    return getAuthHeaders(token);
  }

  // Crear nuevo trabajador
  async createTrabajador(trabajadorData: CreateTrabajadorData): Promise<{ trabajador?: Trabajador; error?: string }> {
    try {
      const response = await axios.post<TrabajadorResponse>(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.TRABAJADORES.CREATE}`,
        trabajadorData,
        { headers: this.getHeaders() }
      );

      if (response.data.status === 'success' && response.data.data && !Array.isArray(response.data.data)) {
        return { trabajador: response.data.data };
      }

      return { error: response.data.message };
    } catch (error: any) {
      console.error('Error al crear trabajador:', error);
      if (error.response?.data?.message) {
        return { error: error.response.data.message };
      }
      return { error: 'Error de conexión con el servidor' };
    }
  }

  // Obtener todos los trabajadores
  async getTrabajadores(): Promise<{ trabajadores?: Trabajador[]; error?: string }> {
    try {
      const response = await axios.get<TrabajadorResponse>(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.TRABAJADORES.GET_ALL}`,
        { headers: this.getHeaders() }
      );

      if (response.data.status === 'success' && response.data.data && Array.isArray(response.data.data)) {
        return { trabajadores: response.data.data };
      }

      return { error: response.data.message };
    } catch (error: any) {
      console.error('Error al obtener trabajadores:', error);
      if (error.response?.data?.message) {
        return { error: error.response.data.message };
      }
      return { error: 'Error de conexión con el servidor' };
    }
  }

  // Buscar trabajadores
  async searchTrabajadores(query: TrabajadorSearchQuery): Promise<{ trabajadores?: Trabajador[]; error?: string }> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await axios.get<TrabajadorResponse>(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.TRABAJADORES.SEARCH}?${queryParams}`,
        { headers: this.getHeaders() }
      );

      if (response.data.status === 'success' && response.data.data) {
        const data = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
        return { trabajadores: data };
      }

      return { error: response.data.message };
    } catch (error: any) {
      console.error('Error al buscar trabajadores:', error);
      if (error.response?.data?.message) {
        return { error: error.response.data.message };
      }
      return { error: 'Error de conexión con el servidor' };
    }
  }

  // Actualizar trabajador
  async updateTrabajador(id: number, trabajadorData: Partial<Trabajador>): Promise<{ trabajador?: Trabajador; error?: string }> {
    try {
      const response = await axios.put<TrabajadorResponse>(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.TRABAJADORES.UPDATE(id)}`,
        trabajadorData,
        { headers: this.getHeaders() }
      );

      if (response.data.status === 'success' && response.data.data && !Array.isArray(response.data.data)) {
        return { trabajador: response.data.data };
      }

      return { error: response.data.message };
    } catch (error: any) {
      console.error('Error al actualizar trabajador:', error);
      if (error.response?.data?.message) {
        return { error: error.response.data.message };
      }
      return { error: 'Error de conexión con el servidor' };
    }
  }

  // Eliminar trabajador (soft delete)
  async deleteTrabajador(id: number): Promise<{ success?: boolean; error?: string }> {
    try {
      const response = await axios.delete<TrabajadorResponse>(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.TRABAJADORES.DELETE(id)}`,
        { headers: this.getHeaders() }
      );

      if (response.data.status === 'success') {
        return { success: true };
      }

      return { error: response.data.message };
    } catch (error: any) {
      console.error('Error al eliminar trabajador:', error);
      if (error.response?.data?.message) {
        return { error: error.response.data.message };
      }
      return { error: 'Error de conexión con el servidor' };
    }
  }
}

// Instancia singleton del servicio
export const trabajadorService = new TrabajadorService(); 