import { useState, useEffect, useCallback } from "react"
import { inventoryExitService } from "@/services/inventario/inventoryExit.service"
import type { CreateInventoryExitData, InventoryExit, ApiResponse } from "@/types/inventory/inventory.types"

export function useInventoryExits() {
    const [exits, setExits] = useState<InventoryExit[]>([])
    const [isLoadingExits, setIsLoadingExits] = useState(false)
    const [isCreatingExit, setIsCreatingExit] = useState(false)
    const [isDeletingExit, setIsDeletingExit] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loadExits = useCallback(async () => {
        setIsLoadingExits(true)
        setError(null)
        try {
            const res: ApiResponse<InventoryExit[]> = await inventoryExitService.getAllExits()
            if (res.success) {
                setExits(res.data || [])
            } else {
                setError(res.message || "Error al cargar salidas de inventario.")
            }
        } catch (err: any) {
            setError(err.message || "Ocurrió un error inesperado al cargar salidas.")
        } finally {
            setIsLoadingExits(false)
        }
    }, [])

    const createExit = useCallback(async (data: CreateInventoryExitData): Promise<ApiResponse<InventoryExit>> => {
        setIsCreatingExit(true)
        setError(null)
        try {
            const res: ApiResponse<InventoryExit> = await inventoryExitService.createExit(data)
            if (res.success) {
                setExits((prev) => [...prev, res.data!])
            } else {
                setError(res.message || "Error al crear salida de inventario.")
            }
            return res
        } catch (err: any) {
            setError(err.message || "Ocurrió un error inesperado al crear salida.")
            return { success: false, message: err.message || "Ocurrió un error inesperado." }
        } finally {
            setIsCreatingExit(false)
        }
    }, [])

    const deleteExit = useCallback(async (id: number): Promise<ApiResponse<any>> => {
        setIsDeletingExit(true)
        setError(null)
        try {
            const res: ApiResponse<any> = await inventoryExitService.deleteExit(id)
            if (res.success) {
                setExits((prev) => prev.filter((exit) => exit.id !== id))
            } else {
                setError(res.message || "Error al eliminar salida de inventario.")
            }
            return res
        } catch (err: any) {
            setError(err.message || "Ocurrió un error inesperado al eliminar salida.")
            return { success: false, message: err.message || "Ocurrió un error inesperado." }
        } finally {
            setIsDeletingExit(false)
        }
    }, [])

    const getExitById = useCallback(async (id: number): Promise<ApiResponse<InventoryExit>> => {
        setError(null)
        try {
            const res: ApiResponse<InventoryExit> = await inventoryExitService.getExitById(id)
            if (!res.success) {
                setError(res.message || "Error al obtener detalles de la salida.")
            }
            return res
        } catch (err: any) {
            setError(err.message || "Ocurrió un error inesperado al obtener detalles.")
            return { success: false, message: err.message || "Ocurrió un error inesperado." }
        }
    }, [])

    useEffect(() => {
        loadExits()
    }, [loadExits])

    return {
        exits,
        isLoadingExits,
        isCreatingExit,
        isDeletingExit,
        error,
        loadExits,
        createExit,
        deleteExit,
        getExitById,
    }
}