import { useState, useEffect, useCallback } from "react"
import { arriendoMaquinariaService } from "../../services/maquinaria/arriendoMaquinaria.service"
import type { ArriendoMaquinaria, CreateArriendoMaquinaria } from "../../types/arriendoMaquinaria.types"

export const useArriendoMaquinaria = () => {
  const [reportes, setReportes] = useState<ArriendoMaquinaria[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReportes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Intentar obtener con inactivas primero, si falla usar la función original
      let response
      try {
        response = await arriendoMaquinariaService.obtenerTodosLosReportesConInactivas()
      } catch {
        response = await arriendoMaquinariaService.obtenerTodosLosReportesSinPaginacion()
      }

      if (response.success && response.data) {
        setReportes(response.data)
      } else {
        setError(response.message || "Error al obtener reportes")
      }
    } catch (err: any) {
      setError(err.message || "Error al obtener reportes")
    } finally {
      setLoading(false)
    }
  }, [])

  const crearReporte = useCallback(async (data: CreateArriendoMaquinaria) => {
    setLoading(true)
    setError(null)
    try {
      const response = await arriendoMaquinariaService.crearReporteTrabajo(data)
      if (response.success && response.data) {
        setReportes((prev) => [response.data!, ...prev])
        return response.data
      } else {
        setError(response.message || "Error al crear reporte")
        throw new Error(response.message || "Error al crear reporte")
      }
    } catch (err: any) {
      setError(err.message || "Error al crear reporte")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const actualizarReporte = useCallback(async (id: number, data: Partial<CreateArriendoMaquinaria>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await arriendoMaquinariaService.actualizarReporte(id, data)
      if (response.success && response.data) {
        setReportes((prev) => prev.map((reporte) => (reporte.id === id ? response.data! : reporte)))
        return response.data
      } else {
        setError(response.message || "Error al actualizar reporte")
        throw new Error(response.message || "Error al actualizar reporte")
      }
    } catch (err: any) {
      setError(err.message || "Error al actualizar reporte")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const eliminarReporte = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await arriendoMaquinariaService.eliminarReporte(id)
      if (response.success) {
        // Actualizar el estado local marcando como inactivo
        setReportes((prev) => prev.map((reporte) => (reporte.id === id ? { ...reporte, isActive: false } : reporte)))
        return true
      } else {
        setError(response.message || "Error al eliminar reporte")
        throw new Error(response.message || "Error al eliminar reporte")
      }
    } catch (err: any) {
      setError(err.message || "Error al eliminar reporte")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const restaurarReporte = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await arriendoMaquinariaService.restaurarReporte(id)
      if (response.success && response.data) {
        setReportes((prev) => prev.map((reporte) => (reporte.id === id ? response.data! : reporte)))
        return response.data
      } else {
        setError(response.message || "Error al restaurar reporte")
        throw new Error(response.message || "Error al restaurar reporte")
      }
    } catch (err: any) {
      setError(err.message || "Error al restaurar reporte")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReportes()
  }, [fetchReportes])

  return {
    reportes,
    loading,
    error,
    crearReporte,
    actualizarReporte,
    eliminarReporte,
    restaurarReporte,
    refetch: fetchReportes,
    fetchAllReportes: fetchReportes,
  }
}

export const useReporteById = (id: number) => {
  const [reporte, setReporte] = useState<ArriendoMaquinaria | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchReporte = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await arriendoMaquinariaService.obtenerReportePorId(id)
        if (response.success && response.data) {
          setReporte(response.data)
        } else {
          setError(response.message || "Error al obtener reporte")
        }
      } catch (err: any) {
        setError(err.message || "Error al obtener reporte")
      } finally {
        setLoading(false)
      }
    }

    fetchReporte()
  }, [id])

  return { reporte, loading, error }
}

export default useArriendoMaquinaria
