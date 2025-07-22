import { apiClient } from '@/config/api.config';
import { ApiResponse } from '@/types';
import { HistorialLaboral, HistorialUnificado } from '@/types/recursosHumanos/historialLaboral.types';

export class HistorialLaboralService {
  private baseURL = '/historial-laboral';

  async getHistorialByTrabajadorId(trabajadorId: number): Promise<ApiResponse<HistorialLaboral[]>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/trabajador/${trabajadorId}`);
      return {
        success: true,
        message: 'Historial laboral obtenido exitosamente',
        data: response.data || []
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al obtener historial laboral',
      };
    }
  }

  async getHistorialUnificadoByTrabajadorId(trabajadorId: number): Promise<ApiResponse<HistorialUnificado[]>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/trabajador/${trabajadorId}/unificado`);
      return {
        success: true,
        message: 'Historial unificado obtenido exitosamente',
        data: response.data || []
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al obtener historial unificado',
      };
    }
  }

  /**
   * Descargar archivo de licencia médica
   */
  async descargarLicenciaMedica(licenciaId: number): Promise<{ success: boolean; blob?: Blob; filename?: string; error?: string }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api'}/licencia-permiso/${licenciaId}/archivo`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `licencia_medica_${licenciaId}.pdf`;
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename\*?=(?:"([^"]*)"|([^;,\s]*))/);
          if (filenameMatch) {
            filename = filenameMatch[1] || filenameMatch[2] || `licencia_medica_${licenciaId}.pdf`;
          }
        }

        return {
          success: true,
          blob,
          filename
        };
      }

      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || 'Error al descargar archivo'
      };
    } catch (error: any) {
      console.error('Error al descargar licencia médica:', error);
      return {
        success: false,
        error: error.message || 'Error al descargar archivo'
      };
    }
  }
}

const historialLaboralService = new HistorialLaboralService();
export default historialLaboralService; 