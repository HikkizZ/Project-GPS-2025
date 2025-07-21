import { apiClient } from '@/config/api.config';
import type {
  MaintenanceSparePart,
  CreateMaintenanceSparePartData,
  UpdateMaintenanceSparePartData
} from '../../types/machinaryMaintenance/maintenanceSparePart.types';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

class MaintenanceSparePartService {
  private baseURL = '/maintenance-spare-parts';

  async getAll(): Promise<ApiResponse<MaintenanceSparePart[]>> {
    try {
      const response = await apiClient.get<{ data: MaintenanceSparePart[] }>(`${this.baseURL}`);
      return {
        success: true,
        message: 'Repuestos utilizados obtenidos exitosamente',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error al obtener repuestos utilizados:', error);
      return {
        success: false,
        message: error.message || 'Error al obtener repuestos utilizados'
      };
    }
  }

  async getById(id: number): Promise<ApiResponse<MaintenanceSparePart>> {
    try {
      const response = await apiClient.get<{ data: MaintenanceSparePart }>(`${this.baseURL}/${id}`);
      return {
        success: true,
        message: 'Repuesto utilizado obtenido exitosamente',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error al obtener repuesto utilizado:', error);
      return {
        success: false,
        message: error.message || 'Error al obtener repuesto utilizado'
      };
    }
  }

  async create(data: CreateMaintenanceSparePartData): Promise<ApiResponse<MaintenanceSparePart>> {
    try {
      const response = await apiClient.post<{ data: MaintenanceSparePart }>(`${this.baseURL}`, data);
      return {
        success: true,
        message: 'Repuesto utilizado registrado exitosamente',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error al registrar repuesto utilizado:', error);
      return {
        success: false,
        message: error.message || 'Error al registrar repuesto utilizado'
      };
    }
  }

  async update(id: number, data: UpdateMaintenanceSparePartData): Promise<ApiResponse<MaintenanceSparePart>> {
    try {
      const response = await apiClient.patch<{ data: MaintenanceSparePart }>(`${this.baseURL}/${id}`, data);
      return {
        success: true,
        message: 'Repuesto utilizado actualizado exitosamente',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error al actualizar repuesto utilizado:', error);
      return {
        success: false,
        message: error.message || 'Error al actualizar repuesto utilizado'
      };
    }
  }

  async delete(id: number): Promise<ApiResponse> {
    try {
      await apiClient.delete(`${this.baseURL}/${id}`);
      return {
        success: true,
        message: 'Repuesto utilizado eliminado y stock restaurado'
      };
    } catch (error: any) {
      console.error('Error al eliminar repuesto utilizado:', error);
      return {
        success: false,
        message: error.message || 'Error al eliminar repuesto utilizado'
      };
    }
  }
}

const maintenanceSparePartService = new MaintenanceSparePartService();
export default maintenanceSparePartService;

// Atajos
export const getMaintenanceSpareParts = () => maintenanceSparePartService.getAll();
export const getMaintenanceSparePart = (id: number) => maintenanceSparePartService.getById(id);
export const createMaintenanceSparePart = (data: CreateMaintenanceSparePartData) =>
  maintenanceSparePartService.create(data);
export const updateMaintenanceSparePart = (id: number, data: UpdateMaintenanceSparePartData) =>
  maintenanceSparePartService.update(id, data);
export const deleteMaintenanceSparePart = (id: number) => maintenanceSparePartService.delete(id);
