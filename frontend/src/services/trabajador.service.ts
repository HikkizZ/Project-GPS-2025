import axios from 'axios';
import { API_CONFIG } from '@/config/api.config';
import {
  Trabajador,
  CreateTrabajadorData,
  TrabajadorSearchQuery,
  TrabajadorResponse
} from '@/types/trabajador.types';

class TrabajadorService {
  private baseURL = API_CONFIG.BASE_URL + '/trabajadores';

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Crear nuevo trabajador
  async createTrabajador(trabajadorData: CreateTrabajadorData): Promise<{ trabajador?: Trabajador; error?: string }> {
    try {
      const response = await axios.post<TrabajadorResponse>(
        this.baseURL,
        trabajadorData,
        { headers: this.getHeaders() }
      );

      if (response.data.status === 'success' && response.data.data && !Array.isArray(response.data.data)) {
        return { trabajador: response.data.data };
      }

      return { error: response.data.message || 'Error al crear trabajador' };
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
        `${this.baseURL}/all`,
        { headers: this.getHeaders() }
      );

      if (response.data.status === 'success' && response.data.data) {
        return { trabajadores: Array.isArray(response.data.data) ? response.data.data : [response.data.data] };
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
        `${this.baseURL}/detail?${queryParams}`,
        { headers: this.getHeaders() }
      );

      if (response.data.status === 'success' && response.data.data) {
        return { trabajadores: Array.isArray(response.data.data) ? response.data.data : [response.data.data] };
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
        `${this.baseURL}/${id}`,
        trabajadorData,
        { headers: this.getHeaders() }
      );

      if (response.data.status === 'success' && response.data.data) {
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

  // Eliminar trabajador
  async deleteTrabajador(id: number): Promise<{ success?: boolean; error?: string }> {
    try {
      const response = await axios.delete<TrabajadorResponse>(
        `${this.baseURL}/${id}`,
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

  // Formatear RUT
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
}

// Instancia singleton del servicio
export const trabajadorService = new TrabajadorService(); 