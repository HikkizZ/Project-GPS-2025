import { apiClient } from "@/config/api.config";
import type { ApiResponse } from "@/types";
import type { CreateInventoryExitData, InventoryExit } from "@/types/inventory/inventory.types";

export class InventoryExitService {
    private baseURL = "/inventory-exit";

    async createExit(data: CreateInventoryExitData): Promise<ApiResponse<InventoryExit>> {
        try {
            const response = await apiClient.post<{ data: InventoryExit; message: string }>(this.baseURL, data);
            return {
                success: true,
                data: response.data,
                message: response.message || "Salida registrada exitosamente",
            };
        } catch (error) {
            throw error;
        }
    }

    async getAllExits(): Promise<ApiResponse<InventoryExit[]>> {
        try {
            const response = await apiClient.get<{ data: InventoryExit[]; message: string }>(`${this.baseURL}/all`);
            return {
                success: true,
                data: response.data,
                message: response.message || "Salidas de inventario obtenidas",
            };
        } catch (error) {
            throw error;
        }
    }

    async getExitById(id: number): Promise<ApiResponse<InventoryExit>> {
        try {
            const response = await apiClient.get<{ data: InventoryExit; message: string }>(`${this.baseURL}/${id}`);
            return {
                success: true,
                data: response.data,
                message: response.message || "Salida de inventario encontrada",
            };
        } catch (error) {
            throw error;
        }
    }

    async deleteExit(id: number): Promise<ApiResponse<InventoryExit>> {
        try {
            const response = await apiClient.delete<{ data: InventoryExit; message: string }>(`${this.baseURL}/${id}`);
            return {
                success: true,
                data: response.data,
                message: response.message || "Salida de inventario eliminada correctamente",
            };
        } catch (error) {
            throw error;
        }
    }
}

export const inventoryExitService = new InventoryExitService();
