import { useState, useEffect, useCallback } from "react"
import { inventoryService } from "@/services/inventario/inventory.service"
import type { InventoryItem, ApiResponse } from "@/types/inventory/inventory.types"

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res: ApiResponse<InventoryItem[]> = await inventoryService.getInventoryItems();
      if (res.success) {
        setInventory(res.data || []);
      } else {
        setError(res.message || "Error al cargar inventario.");
      }
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado al cargar inventario.");
    } finally {
      setIsLoading(false);
    }
  }, []);

    useEffect(() => {
        loadInventory();
    }, [loadInventory]);

    return { inventory, isLoading, error, loadInventory };
}
