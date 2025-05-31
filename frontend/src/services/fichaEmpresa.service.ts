import { API_CONFIG } from '@/config/api.config';
import { 
  FichaEmpresa, 
  FichaEmpresaResponse, 
  FichaEmpresaSearchQuery,
  UpdateFichaEmpresaData,
  ActualizarEstadoData,
  EstadoLaboral
} from '@/types/fichaEmpresa.types';
import axios from 'axios';

class FichaEmpresaService {
  private baseURL = `${API_CONFIG.BASE_URL}/ficha-empresa`;

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Obtener mi ficha personal
  async getMiFicha(): Promise<FichaEmpresaResponse> {
    try {
      const response = await fetch(`${this.baseURL}/mi-ficha`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.message || 'Error al obtener mi ficha' };
      }

      const data = await response.json();
      return { fichaEmpresa: data.data };
    } catch (error) {
      return { error: 'Error de conexión' };
    }
  }

  // Buscar fichas (solo para RRHH/Admin)
  async searchFichas(query: FichaEmpresaSearchQuery): Promise<FichaEmpresaResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      // Agregar parámetros de búsqueda
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (value instanceof Date) {
            queryParams.append(key, value.toISOString().split('T')[0]);
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`${this.baseURL}/search?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.message || 'Error al buscar fichas' };
      }

      const data = await response.json();
      return { fichas: data.data };
    } catch (error) {
      return { error: 'Error de conexión' };
    }
  }

  // Obtener ficha por ID
  async getFichaById(id: number): Promise<FichaEmpresaResponse> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.message || 'Error al obtener ficha' };
      }

      const data = await response.json();
      return { fichaEmpresa: data.data };
    } catch (error) {
      return { error: 'Error de conexión' };
    }
  }

  // Actualizar ficha
  async updateFicha(id: number, fichaData: UpdateFichaEmpresaData): Promise<FichaEmpresaResponse> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(fichaData)
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.message || 'Error al actualizar ficha' };
      }

      const data = await response.json();
      return { fichaEmpresa: data.data };
    } catch (error) {
      return { error: 'Error de conexión' };
    }
  }

  // Actualizar estado de ficha
  async actualizarEstado(id: number, estadoData: ActualizarEstadoData): Promise<FichaEmpresaResponse> {
    try {
      const response = await fetch(`${this.baseURL}/${id}/estado`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(estadoData)
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.message || 'Error al actualizar estado' };
      }

      const data = await response.json();
      return { fichaEmpresa: data.data };
    } catch (error) {
      return { error: 'Error de conexión' };
    }
  }

  // Actualizar solo el estado laboral
  async updateEstadoLaboral(id: number, estadoLaboral: EstadoLaboral, motivo?: string): Promise<FichaEmpresa> {
    const response = await axios.patch(`${API_CONFIG.BASE_URL}/ficha-empresa/${id}/estado`, { 
      estadoLaboral,
      motivo
    });
    
    if (response.status !== 200) {
      throw new Error(response.data?.message || 'Error al actualizar estado laboral');
    }
    
    return response.data.data;
  }

  // Formatear valores para mostrar
  formatSueldo(sueldo: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(sueldo);
  }

  formatFecha(fecha: Date | string): string {
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return date.toLocaleDateString('es-CL');
  }

  // Validaciones
  validateSueldo(sueldo: number): string | null {
    if (sueldo <= 0) return 'El sueldo debe ser mayor a cero';
    if (sueldo > 100000000) return 'El sueldo no puede superar los $100.000.000';
    return null;
  }

  validateFecha(fechaInicio: Date | string, fechaFin?: Date | string): string | null {
    const inicio = new Date(fechaInicio);
    if (fechaFin) {
      const fin = new Date(fechaFin);
      if (fin <= inicio) {
        return 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }
    return null;
  }
}

export const fichaEmpresaService = new FichaEmpresaService(); 