import { API_CONFIG } from '@/config/api.config';
import { 
  FichaEmpresa, 
  FichaEmpresaResponse, 
  FichaEmpresaSearchQuery,
  UpdateFichaEmpresaData,
  CreateFichaEmpresaData,
  ActualizarEstadoData,
  EstadoLaboral
} from '@/types/recursosHumanos/fichaEmpresa.types';
import axios from 'axios';

// Configurar axios con interceptor para token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// Exportar la clase
export class FichaEmpresaService {
  private baseURL = `${API_CONFIG.BASE_URL}/ficha-empresa`;

  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Obtener todas las fichas con filtros
  async getFichasEmpresa(searchParams: FichaEmpresaSearchQuery = {}): Promise<ApiResponse<FichaEmpresa[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Formatear fechas a ISO string si es necesario
          if (value instanceof Date) {
            queryParams.append(key, value.toISOString());
          } else if (key === 'rut') {
            // Limpiar el RUT antes de enviarlo
            const cleanRut = value.toString().replace(/\./g, '').replace(/-/g, '');
            queryParams.append(key, cleanRut);
          } else if (Array.isArray(value)) {
            value.forEach((v) => {
              queryParams.append(`${key}[]`, v);
            });
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const response = await axios.get(`${this.baseURL}/search?${queryParams}`, {
        headers: this.getAuthHeaders()
      });

      return {
        success: true,
        message: 'Fichas obtenidas exitosamente',
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Error al obtener fichas:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener fichas'
      };
    }
  }

  // Obtener ficha por ID
  async getFichaEmpresaById(id: number): Promise<ApiResponse<FichaEmpresa>> {
    try {
      const response = await axios.get(`${this.baseURL}/${id}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.data.data) {
        throw new Error('No se encontró la ficha solicitada');
      }

      return {
        success: true,
        message: 'Ficha obtenida exitosamente',
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Error al obtener ficha:', error);
      return {
        success: false,
        message: error.response?.status === 404 
          ? 'La ficha solicitada no existe o fue eliminada'
          : error.response?.data?.message || 'Error al obtener ficha'
      };
    }
  }

  // Obtener mi ficha personal
  async getMiFicha(): Promise<ApiResponse<FichaEmpresa>> {
    try {
      const response = await axios.get(`${this.baseURL}/mi-ficha`, {
        headers: this.getAuthHeaders()
      });
      return {
        success: true,
        message: 'Ficha personal obtenida exitosamente',
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Error al obtener mi ficha:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener mi ficha'
      };
    }
  }

  // Crear nueva ficha
  async createFichaEmpresa(data: CreateFichaEmpresaData): Promise<ApiResponse<FichaEmpresa>> {
    try {
      const response = await axios.post(this.baseURL, data, {
        headers: this.getAuthHeaders()
      });
      return {
        success: true,
        message: 'Ficha creada exitosamente',
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Error al crear ficha:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al crear ficha'
      };
    }
  }

  // Actualizar ficha
  async updateFichaEmpresa(id: number, data: UpdateFichaEmpresaData): Promise<ApiResponse<FichaEmpresa>> {
    try {
      console.log('Actualizando ficha:', { id, data });
      const response = await axios.put(`${this.baseURL}/${id}`, data, {
        headers: this.getAuthHeaders()
      });
      return {
        success: true,
        message: 'Ficha actualizada exitosamente',
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Error al actualizar ficha:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar ficha'
      };
    }
  }

  // Actualizar estado
  async updateEstadoLaboral(id: number, estado: EstadoLaboral, motivo?: string): Promise<ApiResponse<FichaEmpresa>> {
    try {
      const response = await axios.put(
        `${this.baseURL}/${id}/estado`,
        { estado, motivo },
        { headers: this.getAuthHeaders() }
      );

      return {
        success: true,
        message: 'Estado actualizado exitosamente',
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Error al actualizar estado:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar estado'
      };
    }
  }

  // Buscar por RUT
  async getFichaByRUT(rut: string): Promise<ApiResponse<FichaEmpresa | null>> {
    try {
      // Limpiar el RUT antes de enviarlo al backend
      const cleanRut = rut.replace(/\./g, '').replace(/-/g, '');
      const response = await axios.get(`${this.baseURL}/search?rut=${cleanRut}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.data.data || !Array.isArray(response.data.data) || response.data.data.length === 0) {
        return {
          success: false,
          message: 'No se encontró ninguna ficha con el RUT especificado',
          data: null
        };
      }

      const fichas = response.data.data;
      return {
        success: true,
        message: 'Búsqueda completada',
        data: fichas[0]
      };
    } catch (error: any) {
      console.error('Error al buscar por RUT:', error);
      return {
        success: false,
        message: error.response?.status === 404 
          ? 'No se encontró ninguna ficha con el RUT especificado'
          : error.response?.data?.message || 'Error al buscar por RUT'
      };
    }
  }

  // Manejo de contratos
  async uploadContrato(fichaId: number, file: File): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append('contrato', file);

      const response = await axios.post(
        `${this.baseURL}/${fichaId}/upload-contrato`,
        formData,
        {
          headers: {
            ...this.getAuthHeaders(),
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return {
        success: true,
        data: response.data,
        message: 'Contrato subido exitosamente'
      };
    } catch (error: any) {
      console.error('Error al subir contrato:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al subir el contrato'
      };
    }
  }

  async downloadContrato(fichaId: number): Promise<void> {
    try {
      const response = await axios.get(
        `${this.baseURL}/${fichaId}/contrato`,
        {
          responseType: 'blob',
          headers: this.getAuthHeaders()
        }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'contrato.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error al descargar contrato:', error);
      throw new Error(error.response?.data?.message || 'Error al descargar el contrato');
    }
  }

  async deleteContrato(fichaId: number): Promise<ApiResponse> {
    try {
      const response = await axios.delete(`${this.baseURL}/${fichaId}/delete-contrato`, {
        headers: this.getAuthHeaders()
      });
      return {
        success: true,
        message: 'Contrato eliminado exitosamente',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error al eliminar contrato:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al eliminar el contrato'
      };
    }
  }

  // Utilidades estáticas
  static formatSalario(salario: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(salario);
  }

  static formatFecha(fecha: Date | string): string {
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return date.toLocaleDateString('es-CL');
  }

  static getEstadoLaboralColor(estado: EstadoLaboral): string {
    const colors = {
      [EstadoLaboral.ACTIVO]: 'success',
      [EstadoLaboral.LICENCIA]: 'warning',
      [EstadoLaboral.PERMISO]: 'info',
      [EstadoLaboral.DESVINCULADO]: 'danger'
    };
    return colors[estado] || 'secondary';
  }

  static getEstadoLaboralIcon(estado: EstadoLaboral): string {
    const icons = {
      [EstadoLaboral.ACTIVO]: 'bi-person-check',
      [EstadoLaboral.LICENCIA]: 'bi-person-dash',
      [EstadoLaboral.PERMISO]: 'bi-person-lines-fill',
      [EstadoLaboral.DESVINCULADO]: 'bi-person-x'
    };
    return icons[estado] || 'bi-person';
  }
}

// Instancia del servicio
const fichaEmpresaService = new FichaEmpresaService();

// Exportar funciones individuales
export const getFichaEmpresa = (id: number) => fichaEmpresaService.getFichaEmpresaById(id);
export const updateFichaEmpresa = (id: number, data: UpdateFichaEmpresaData) => fichaEmpresaService.updateFichaEmpresa(id, data);
export const uploadContrato = (fichaId: number, file: File) => fichaEmpresaService.uploadContrato(fichaId, file);
export const downloadContrato = (fichaId: number) => fichaEmpresaService.downloadContrato(fichaId);
export const deleteContrato = (fichaId: number) => fichaEmpresaService.deleteContrato(fichaId);

// Exportar el servicio por defecto
export default fichaEmpresaService; 