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
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Obtener todas las fichas con filtros
  async getFichasEmpresa(searchParams: FichaEmpresaSearchQuery = {}): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await axios.get(`${this.baseURL}/search?${queryParams}`, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      throw new Error('Error al obtener fichas');
    }
  }

  // Obtener ficha por ID
  async getFichaEmpresaById(id: number): Promise<FichaEmpresa> {
    try {
      const response = await axios.get(`${this.baseURL}/${id}`, {
        headers: this.getAuthHeaders()
      });
      return response.data.data;
    } catch (error) {
      throw new Error('Error al obtener ficha');
    }
  }

  // Obtener mi ficha personal
  async getMiFicha(): Promise<FichaEmpresa> {
    try {
      const response = await axios.get(`${this.baseURL}/mi-ficha`, {
        headers: this.getAuthHeaders()
      });
      return response.data.data;
    } catch (error) {
      throw new Error('Error al obtener mi ficha');
    }
  }

  // Actualizar ficha
  async updateFichaEmpresa(id: number, data: UpdateFichaEmpresaData): Promise<FichaEmpresaResponse> {
    try {
      const response = await axios.put(`${this.baseURL}/${id}`, data, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error('Error al actualizar ficha');
    }
  }

  // Actualizar estado
  async updateEstadoLaboral(id: number, estado: EstadoLaboral, motivo?: string): Promise<FichaEmpresa> {
    try {
      const response = await axios.put(
        `${this.baseURL}/${id}/estado`,
        { estado, motivo },
        { headers: this.getAuthHeaders() }
      );

      if (response.status !== 200) {
        throw new Error(response.data?.message || 'Error al actualizar estado');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.message || 'Error al actualizar estado');
      }
      throw new Error('Error de conexión al actualizar estado');
    }
  }

  // Buscar por RUT
  async getFichaByRUT(rut: string): Promise<FichaEmpresa | null> {
    try {
      const response = await axios.get(`${this.baseURL}/search?rut=${rut}`, {
        headers: this.getAuthHeaders()
      });
      const fichas = response.data.data;
      return fichas.length > 0 ? fichas[0] : null;
    } catch (error) {
      throw new Error('Error al buscar por RUT');
    }
  }

  // Utilidades
  formatSalario(sueldo: number): string {
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

  getEstadoLaboralColor(estado: EstadoLaboral): string {
    switch (estado) {
      case EstadoLaboral.ACTIVO:
        return 'success';
      case EstadoLaboral.LICENCIA:
        return 'warning';
      case EstadoLaboral.PERMISO:
        return 'info';
      case EstadoLaboral.DESVINCULADO:
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getEstadoLaboralIcon(estado: EstadoLaboral): string {
    switch (estado) {
      case EstadoLaboral.ACTIVO:
        return 'bi-person-check';
      case EstadoLaboral.LICENCIA:
        return 'bi-person-dash';
      case EstadoLaboral.PERMISO:
        return 'bi-person-lines-fill';
      case EstadoLaboral.DESVINCULADO:
        return 'bi-person-x';
      default:
        return 'bi-person';
    }
  }
}

export const fichaEmpresaService = new FichaEmpresaService(); 