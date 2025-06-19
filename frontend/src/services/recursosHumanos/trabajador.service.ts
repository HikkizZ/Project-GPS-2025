import axios from 'axios';
import { API_CONFIG } from '@/config/api.config';
import {
  Trabajador,
  CreateTrabajadorData,
  TrabajadorSearchQuery,
  TrabajadorResponse
} from '@/types/recursosHumanos/trabajador.types';

class TrabajadorService {
  private baseURL = API_CONFIG.BASE_URL + '/trabajadores';

  private getHeaders() {
    const token = localStorage.getItem('authToken');
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

      if (response.data.status === 'success' && response.data.data) {
        // Asegurarnos de que data es un único trabajador y no un array
        const trabajador = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
        return { trabajador, advertencias: response.data.advertencias || [] };
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
        const trabajadores = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
        return { trabajadores };
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
          // Enviar el RUT tal como lo ingresa el usuario (con puntos y guion)
          queryParams.append(key, value.toString());
        }
      });

      const response = await axios.get<TrabajadorResponse>(
        `${this.baseURL}/detail?${queryParams}`,
        { headers: this.getHeaders() }
      );

      if (response.data.status === 'success' && response.data.data) {
        const trabajadores = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
        return { trabajadores };
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
      // Primero actualizamos el trabajador
      const response = await axios.put<TrabajadorResponse>(
        `${this.baseURL}/${id}`,
        trabajadorData,
        { headers: this.getHeaders() }
      );

      if (response.data.status === 'success' && response.data.data) {
        // Asegurarnos de que data es un único trabajador y no un array
        const trabajador = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
        return { trabajador };
      }

      return { error: response.data.message || 'Error al actualizar trabajador' };
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

  // Desvincular trabajador
  async desvincularTrabajador(id: number, motivo: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await axios.post(
        `${this.baseURL}/${id}/desvincular`,
        { motivo },
        { headers: this.getHeaders() }
      );

      if (response.data.status === 'success') {
        return { success: true };
      }

      return { success: false, error: response.data.message };
    } catch (error: any) {
      console.error('Error al desvincular trabajador:', error);
      if (error.response?.data?.message) {
        return { success: false, error: error.response.data.message };
      }
      return { success: false, error: 'Error de conexión con el servidor' };
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