import { useState, useEffect, useCallback } from "react"
import { inventoryEntryService } from "@/services/inventario/inventoryEntry.service"
import type { CreateInventoryEntryData, InventoryEntry, ApiResponse } from "@/types/inventory/inventory.types"

export function useInventoryEntries() {
    const [entries, setEntries] = useState<InventoryEntry[]>([])
    const [isLoadingEntries, setIsLoadingEntries] = useState(false)
    const [isCreatingEntry, setIsCreatingEntry] = useState(false)
    const [isDeletingEntry, setIsDeletingEntry] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loadEntries = useCallback(async () => {
        setIsLoadingEntries(true)
        setError(null)
        try {
            const res: ApiResponse<InventoryEntry[]> = await inventoryEntryService.getAllEntries()
            if (res.success) {
                setEntries(res.data || [])
            } else {
                setError(res.message || "Error al cargar entradas de inventario.")
            }
        } catch (err: any) {
            setError(err.message || "Ocurrió un error inesperado al cargar entradas.")
        } finally {
            setIsLoadingEntries(false)
        }
    }, [])

    const createEntry = useCallback(async (data: CreateInventoryEntryData): Promise<ApiResponse<InventoryEntry>> => {
        setIsCreatingEntry(true)
        setError(null)
        try {
            const res: ApiResponse<InventoryEntry> = await inventoryEntryService.createEntry(data)
            if (res.success) {
                setEntries((prev) => [...prev, res.data!])
            } else {
                setError(res.message || "Error al crear entrada de inventario.")
            }
            return res
        } catch (err: any) {
            setError(err.message || "Ocurrió un error inesperado al crear entrada.")
            return { success: false, message: err.message || "Ocurrió un error inesperado." }
        } finally {
            setIsCreatingEntry(false)
        }
    }, [])

    const deleteEntry = useCallback(async (id: number): Promise<ApiResponse<any>> => {
        setIsDeletingEntry(true)
        setError(null)
        try {
            const res: ApiResponse<any> = await inventoryEntryService.deleteEntry(id)
            if (res.success) {
                setEntries((prev) => prev.filter((entry) => entry.id !== id))
            } else {
                setError(res.message || "Error al eliminar entrada de inventario.")
            }
            return res
        } catch (err: any) {
            setError(err.message || "Ocurrió un error inesperado al eliminar entrada.")
            return { success: false, message: err.message || "Ocurrió un error inesperado." }
        } finally {
            setIsDeletingEntry(false)
        }
    }, [])

    const getEntryById = useCallback(async (id: number): Promise<ApiResponse<InventoryEntry>> => {
        setError(null)
        try {
            const res: ApiResponse<InventoryEntry> = await inventoryEntryService.getEntryById(id)
            if (!res.success) {
                setError(res.message || "Error al obtener detalles de la entrada.")
            }
            return res
        } catch (err: any) {
            setError(err.message || "Ocurrió un error inesperado al obtener detalles.")
            return { success: false, message: err.message || "Ocurrió un error inesperado." }
        }
    }, [])

    useEffect(() => {
        loadEntries()
    }, [loadEntries])

    return {
        entries,
        isLoadingEntries,
        isCreatingEntry,
        isDeletingEntry,
        error,
        loadEntries,
        createEntry,
        deleteEntry,
        getEntryById,
    }
}