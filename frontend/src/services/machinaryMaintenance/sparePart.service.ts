import { apiClient } from '@/config/api.config';
import type { SparePart, CreateSparePartData, UpdateSparePartData } from '@/types/machinaryMaintenance/sparePart.types';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

class SparePartService {
  private baseURL = '/spare-parts';

  async getAll(): Promise<ApiResponse<SparePart[]>> {
    try {
      const response = await apiClient.get<{ data: SparePart[] }>(this.baseURL);
      return {
        success: true,
        message: 'Repuestos obtenidos exitosamente',
        data: response.data,
      };
    } catch (error: any) {
      console.error('Error al obtener repuestos:', error);
      return {
        success: false,
        message: error.message || 'Error al obtener repuestos',
      };
    }
  }

  async getById(id: number): Promise<ApiResponse<SparePart>> {
    try {
      const response = await apiClient.get<{ data: SparePart }>(`${this.baseURL}/${id}`);
      return {
        success: true,
        message: 'Repuesto obtenido exitosamente',
        data: response.data,
      };
    } catch (error: any) {
      console.error('Error al obtener repuesto:', error);
      return {
        success: false,
        message: error.message || 'Error al obtener repuesto',
      };
    }
  }

  async create(data: CreateSparePartData): Promise<ApiResponse<SparePart>> {
    try {
      const payload = {
        name: data.name,
        stock: data.stock,
        marca: data.marca,
        modelo: data.modelo,
        anio: data.anio,
      };

      const response = await apiClient.post<{ data: SparePart }>(this.baseURL, payload);
      return {
        success: true,
        message: 'Repuesto creado exitosamente',
        data: response.data,
      };
    } catch (error: any) {
      console.error('Error al crear repuesto:', error);
      return {
        success: false,
        message: error.message || 'Error al crear repuesto',
      };
    }
  }

  async update(id: number, data: UpdateSparePartData): Promise<ApiResponse<SparePart>> {
    try {
      const response = await apiClient.patch<{ data: SparePart }>(`${this.baseURL}/${id}`, data);
      return {
        success: true,
        message: 'Repuesto actualizado exitosamente',
        data: response.data,
      };
    } catch (error: any) {
      console.error('Error al actualizar repuesto:', error);
      return {
        success: false,
        message: error.message || 'Error al actualizar repuesto',
      };
    }
  }

  async delete(id: number): Promise<ApiResponse> {
    try {
      await apiClient.delete(`${this.baseURL}/${id}`);
      return {
        success: true,
        message: 'Repuesto eliminado exitosamente',
      };
    } catch (error: any) {
      console.error('Error al eliminar repuesto:', error);
      return {
        success: false,
        message: error.message || 'Error al eliminar repuesto',
      };
    }
  }
}

const sparePartService = new SparePartService();
export default sparePartService;

export const getSpareParts = () => sparePartService.getAll();
export const getSparePart = (id: number) => sparePartService.getById(id);
export const createSparePart = (data: CreateSparePartData) => sparePartService.create(data);
export const updateSparePart = (id: number, data: UpdateSparePartData) => sparePartService.update(id, data);
export const deleteSparePart = (id: number) => sparePartService.delete(id);
