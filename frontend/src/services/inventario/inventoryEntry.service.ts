import { apiClient } from "@/config/api.config";
import type { ApiResponse } from "@/types";
import type { CreateInventoryEntryData, InventoryEntry } from "@/types/inventory/inventory.types";

export class InventoryEntryService {
    private baseURL = "/inventory-entry";

    async createEntry(data: CreateInventoryEntryData): Promise<ApiResponse<InventoryEntry>> {
        try {
            const response = await apiClient.post<{ data: InventoryEntry; message: string }>(this.baseURL, data);
            return {
                success: true,
                data: response.data,
                message: response.message || "Entrada registrada exitosamente",
            };
        } catch (error) {
            throw error;
        }
    }

    async getAllEntries(): Promise<ApiResponse<InventoryEntry[]>> {
        try {
            const response = await apiClient.get<{ data: InventoryEntry[]; message: string }>(`${this.baseURL}/all`);
            return {
                success: true,
                data: response.data,
                message: response.message || "Entradas de inventario obtenidas",
            };
        } catch (error) {
            throw error;
        }
    }

    async getEntryById(id: number): Promise<ApiResponse<InventoryEntry>> {
        try {
            const response = await apiClient.get<{ data: InventoryEntry; message: string }>(`${this.baseURL}/${id}`);
            return {
                success: true,
                data: response.data,
                message: response.message || "Entrada de inventario encontrada",
            };
        } catch (error) {
            throw error;
        }
    }

    async deleteEntry(id: number): Promise<ApiResponse<InventoryEntry>> {
        try {
            const response = await apiClient.delete<{ data: InventoryEntry; message: string }>(`${this.baseURL}/${id}`);
            return {
                success: true,
                data: response.data,
                message: response.message || "Entrada eliminada correctamente",
            };
        } catch (error) {
            throw error;
        }
    }
}

export const inventoryEntryService = new InventoryEntryService();
