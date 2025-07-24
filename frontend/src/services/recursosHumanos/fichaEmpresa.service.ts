import { apiClient } from '@/config/api.config';
import { ApiResponse } from '@/types';
import type {
  FichaEmpresa,
  FichaEmpresaSearchQuery,
  CreateFichaEmpresaData,
  UpdateFichaEmpresaData
} from '../../types/recursosHumanos/fichaEmpresa.types';
import { EstadoLaboral } from '../../types/recursosHumanos/fichaEmpresa.types';

// Exportar la clase
export class FichaEmpresaService {
  private baseURL = '/fichas-empresa';

  // Obtener todas las fichas con filtros
  async getFichasEmpresa(searchParams: FichaEmpresaSearchQuery = {}): Promise<ApiResponse<FichaEmpresa[]>> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (value instanceof Date) {
            queryParams.append(key, value.toISOString());
          } else if (key === 'rut') {
            const cleanRut = value.toString().replace(/\./g, '').replace(/-/g, '');
            queryParams.append(key, cleanRut);
          } else if (Array.isArray(value)) {
            value.forEach((v) => {
              queryParams.append(`${key}[]`, v.toString());
            });
          } else {
            const stringValue = value.toString().trim();
            queryParams.append(key, stringValue);
          }
        }
      });
      const url = queryParams.toString() ? `${this.baseURL}/?${queryParams}` : `${this.baseURL}/`;
      const data = await apiClient.get<{ data: FichaEmpresa[] }>(url);
      return {
        success: true,
        message: 'Fichas obtenidas exitosamente',
        data: data.data || []
      };
    } catch (error: any) {
      console.error('Error al obtener fichas:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al obtener fichas'
      };
    }
  }

  // Eliminar método getFichaEmpresaById

  // Obtener mi ficha personal
  async getMiFicha(): Promise<ApiResponse<FichaEmpresa>> {
    try {
      const data = await apiClient.get<{ data: FichaEmpresa }>(`${this.baseURL}/mi-ficha`);
      return {
        success: true,
        message: 'Ficha personal obtenida exitosamente',
        data: data.data
      };
    } catch (error: any) {
      console.error('Error al obtener mi ficha:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al obtener mi ficha'
      };
    }
  }

  // Crear nueva ficha
  async createFichaEmpresa(data: CreateFichaEmpresaData): Promise<ApiResponse<FichaEmpresa>> {
    try {
      const response = await apiClient.post<{ data: FichaEmpresa }>(this.baseURL, data);
      return {
        success: true,
        message: 'Ficha creada exitosamente',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error al crear ficha:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al crear ficha'
      };
    }
  }

  // Actualizar ficha
  async updateFichaEmpresa(id: number, data: any): Promise<ApiResponse<FichaEmpresa>> {
    try {
      const response = await apiClient.patch<{ data: FichaEmpresa }>(`${this.baseURL}/${id}`, data);
      return {
        success: true,
        message: 'Ficha actualizada exitosamente',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error al actualizar ficha:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al actualizar ficha'
      };
    }
  }

  // Actualizar estado
  async updateEstadoLaboral(id: number, estado: EstadoLaboral, motivo?: string): Promise<ApiResponse<FichaEmpresa>> {
    try {
      const response = await apiClient.put<{ data: FichaEmpresa }>(
        `${this.baseURL}/${id}/estado`,
        { estado, motivo }
      );

      return {
        success: true,
        message: 'Estado actualizado exitosamente',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error al actualizar estado:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al actualizar estado'
      };
    }
  }

  // Buscar por RUT
  async getFichaByRUT(rut: string): Promise<ApiResponse<FichaEmpresa | null>> {
    try {
      const cleanRut = rut.replace(/\./g, '').replace(/-/g, '');
      const data = await apiClient.get<{ data: FichaEmpresa[] }>(`${this.baseURL}/?rut=${cleanRut}`);
      if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
        return {
          success: false,
          message: 'No se encontró ninguna ficha con el RUT especificado',
          data: null
        };
      }
      const fichas = data.data;
      return {
        success: true,
        message: 'Búsqueda completada',
        data: fichas[0]
      };
    } catch (error: any) {
      console.error('Error al buscar por RUT:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al buscar por RUT',
        data: null
      };
    }
  }

  // Upload de contrato
  async uploadContrato(fichaId: number, file: File): Promise<ApiResponse> {
    try {
      // Ruta correcta para la subida de archivos
      await apiClient.uploadFile(`${this.baseURL}/${fichaId}/upload-contrato`, file, 'contrato');
      return {
        success: true,
        message: 'Contrato subido exitosamente'
      };
    } catch (error: any) {
      console.error('Error al subir contrato:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al subir contrato'
      };
    }
  }

  // Download de contrato
  async downloadContrato(fichaId: number): Promise<void> {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api'}${this.baseURL}/${fichaId}/contrato`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `contrato_${fichaId}.pdf`;
        
        if (contentDisposition) {
          // Buscar filename= seguido de comillas opcionales y cualquier carácter hasta comillas opcionales o fin de línea
          const filenameMatch = contentDisposition.match(/filename\*?=(?:"([^"]*)"|([^;,\s]*))/);
          if (filenameMatch) {
            filename = filenameMatch[1] || filenameMatch[2] || `contrato_${fichaId}.pdf`;
          }
        }

        // Crear enlace de descarga
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al descargar contrato');
      }
    } catch (error: any) {
      console.error('Error al descargar contrato:', error);
      throw error;
    }
  }

  // Eliminar contrato
  async deleteContrato(fichaId: number): Promise<ApiResponse> {
    try {
      await apiClient.delete(`${this.baseURL}/${fichaId}/contrato`);
      return {
        success: true,
        message: 'Contrato eliminado exitosamente'
      };
    } catch (error: any) {
      console.error('Error al eliminar contrato:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al eliminar contrato'
      };
    }
  }

  // Métodos estáticos para utilidades
  static formatSalario(salario: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(salario);
  }

  static formatFecha(fecha: Date | string): string {
    if (!fecha) return '-';
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('es-CL');
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
      [EstadoLaboral.LICENCIA]: 'bi-person-x',
      [EstadoLaboral.PERMISO]: 'bi-person-dash',
      [EstadoLaboral.DESVINCULADO]: 'bi-person-x'
    };
    return icons[estado] || 'bi-person';
  }
}

// Crear una instancia por defecto del servicio
const fichaEmpresaService = new FichaEmpresaService();
export default fichaEmpresaService;

// Funciones de conveniencia para uso directo
export const getFichaEmpresa = (searchParams: FichaEmpresaSearchQuery = {}) => fichaEmpresaService.getFichasEmpresa(searchParams);
export const updateFichaEmpresa = (id: number, data: any) => fichaEmpresaService.updateFichaEmpresa(id, data);
export const uploadContrato = (fichaId: number, file: File) => fichaEmpresaService.uploadContrato(fichaId, file);
export const downloadContrato = (fichaId: number) => fichaEmpresaService.downloadContrato(fichaId);
export const deleteContrato = (fichaId: number) => fichaEmpresaService.deleteContrato(fichaId); 