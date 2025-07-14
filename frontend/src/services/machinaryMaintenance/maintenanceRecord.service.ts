import { apiClient } from '@/config/api.config';
import type {
  MaintenanceRecord,
  CreateMaintenanceRecordData,
  UpdateMaintenanceRecordData
} from '../../types/machinaryMaintenance/maintenanceRecord.types';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export class MaintenanceRecordService {
  private baseURL = '/maintenance-records';

  async getAll(): Promise<ApiResponse<MaintenanceRecord[]>> {
    try {
      const response = await apiClient.get<{ data: MaintenanceRecord[] }>(`${this.baseURL}`);
      return {
        success: true,
        message: 'Mantenciones obtenidas exitosamente',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error al obtener mantenciones:', error);
      return {
        success: false,
        message: error.message || 'Error al obtener mantenciones'
      };
    }
  }

  async getById(id: number): Promise<ApiResponse<MaintenanceRecord>> {
    try {
      const response = await apiClient.get<{ data: MaintenanceRecord }>(`${this.baseURL}/${id}`);
      return {
        success: true,
        message: 'Mantención obtenida exitosamente',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error al obtener mantención:', error);
      return {
        success: false,
        message: error.message || 'Error al obtener mantención'
      };
    }
  }

  async create(data: CreateMaintenanceRecordData): Promise<ApiResponse<MaintenanceRecord>> {
    try {
      const response = await apiClient.post<{ data: MaintenanceRecord }>(`${this.baseURL}`, data);
      return {
        success: true,
        message: 'Mantención creada exitosamente',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error al crear mantención:', error);
      return {
        success: false,
        message: error.message || 'Error al crear mantención'
      };
    }
  }

  async update(id: number, data: UpdateMaintenanceRecordData): Promise<ApiResponse<MaintenanceRecord>> {
    try {
      const response = await apiClient.put<{ data: MaintenanceRecord }>(`${this.baseURL}/${id}`, data);
      return {
        success: true,
        message: 'Mantención actualizada exitosamente',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error al actualizar mantención:', error);
      return {
        success: false,
        message: error.message || 'Error al actualizar mantención'
      };
    }
  }

  async delete(id: number): Promise<ApiResponse> {
    try {
      await apiClient.delete(`${this.baseURL}/${id}`);
      return {
        success: true,
        message: 'Mantención eliminada exitosamente'
      };
    } catch (error: any) {
      console.error('Error al eliminar mantención:', error);
      return {
        success: false,
        message: error.message || 'Error al eliminar mantención'
      };
    }
  }
}

// Instancia única para usar directamente
const maintenanceRecordService = new MaintenanceRecordService();
export default maintenanceRecordService;

// Funciones de conveniencia
export const getMaintenanceRecords = () => maintenanceRecordService.getAll();
export const getMaintenanceRecord = (id: number) => maintenanceRecordService.getById(id);
export const createMaintenance = (data: CreateMaintenanceRecordData) => maintenanceRecordService.create(data);
export const updateMaintenance = (id: number, data: UpdateMaintenanceRecordData) => maintenanceRecordService.update(id, data);
export const deleteMaintenance = (id: number) => maintenanceRecordService.delete(id);
