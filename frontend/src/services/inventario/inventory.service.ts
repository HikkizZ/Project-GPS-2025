import { apiClient } from "@/config/api.config"
import { InventoryItem, ApiResponse } from "@/types/inventory/inventory.types";

export class InventoryService {
    private baseURL = "/inventory"

    async getInventoryItems(): Promise<ApiResponse<InventoryItem[]>> {
        try {
            const response = await apiClient.get<{ data: InventoryItem[]; message: string }>(`${this.baseURL}/`);
            return {
                success: true,
                data: response.data,
                message: response.message || "Inventario obtenido correctamente",
            };
        } catch (error) {
            throw error;
        }
    }
}

export const inventoryService = new InventoryService();