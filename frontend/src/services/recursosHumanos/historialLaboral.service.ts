import { apiClient } from '@/config/api.config';
import { ApiResponse } from '@/types';
import { HistorialLaboral } from '@/types/recursosHumanos/historialLaboral.types';

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
}

const historialLaboralService = new HistorialLaboralService();
export default historialLaboralService; 