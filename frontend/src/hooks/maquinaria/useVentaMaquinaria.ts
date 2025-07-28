import { useState, useEffect, useCallback } from "react"
import { ventaMaquinariaService } from "../../services/maquinaria/ventaMaquinaria.service"
import type { VentaMaquinaria, CreateVentaMaquinaria } from "../../types/maquinaria.types"

export const useVentaMaquinaria = () => {
  const [ventas, setVentas] = useState<VentaMaquinaria[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fetchVentas = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Intentar obtener con inactivas primero, si falla usar la función original
      let response
      try {
        response = await ventaMaquinariaService.obtenerTodasLasVentasConInactivas()
      } catch {
        response = await ventaMaquinariaService.obtenerTodasLasVentas()
      }

      if (response.success && response.data) {
        setVentas(response.data)
      } else {
        setError(response.message || "Error al obtener ventas")
      }
    } catch (err: any) {
      setError(err.message || "Error al obtener ventas")
    } finally {
      setLoading(false)
    }
  }, [])

  const registrarVenta = useCallback(async (data: CreateVentaMaquinaria) => {
    setLoading(true)
    setError(null)
    try {
      const response = await ventaMaquinariaService.registrarVenta(data)
      if (response.success && response.data) {
        setVentas((prev) => [response.data!, ...prev])
        return response.data
      } else {
        setError(response.message || "Error al registrar venta")
        throw new Error(response.message || "Error al registrar venta")
      }
    } catch (err: any) {
      setError(err.message || "Error al registrar venta")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const actualizarVenta = useCallback(async (id: number, data: Partial<CreateVentaMaquinaria>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await ventaMaquinariaService.actualizarVenta(id, data)
      if (response.success && response.data) {
        setVentas((prev) => prev.map((venta) => (venta.id === id ? response.data! : venta)))
        return response.data
      } else {
        setError(response.message || "Error al actualizar venta")
        throw new Error(response.message || "Error al actualizar venta")
      }
    } catch (err: any) {
      setError(err.message || "Error al actualizar venta")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // SoftDelete, ya probado y que funciona :D
  const eliminarVenta = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await ventaMaquinariaService.eliminarVenta(id)
      if (response.success) {
        // Se acutaliza el estado local marcandolo como inactivo
        setVentas((prev) => prev.map((venta) => (venta.id === id ? { ...venta, isActive: false } : venta)))
        return true
      } else {
        setError(response.message || "Error al eliminar venta")
        throw new Error(response.message || "Error al eliminar venta")
      }
    } catch (err: any) {
      setError(err.message || "Error al eliminar venta")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const restaurarVenta = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await ventaMaquinariaService.restaurarVenta(id)
      if (response.success && response.data) {
        setVentas((prev) => prev.map((venta) => (venta.id === id ? response.data! : venta)))
        return response.data
      } else {
        setError(response.message || "Error al restaurar venta")
        throw new Error(response.message || "Error al restaurar venta")
      }
    } catch (err: any) {
      setError(err.message || "Error al restaurar venta")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVentas()
  }, [fetchVentas])

  return {
    ventas,
    loading,
    error,
    registrarVenta,
    actualizarVenta,
    eliminarVenta,
    restaurarVenta,
    refetch: fetchVentas,
  }
}

export const useVentaById = (id: number) => {
  const [venta, setVenta] = useState<VentaMaquinaria | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchVenta = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await ventaMaquinariaService.obtenerVentaPorId(id)
        if (response.success && response.data) {
          setVenta(response.data)
        } else {
          setError(response.message || "Error al obtener venta")
        }
      } catch (err: any) {
        setError(err.message || "Error al obtener venta")
      } finally {
        setLoading(false)
      }
    }

    fetchVenta()
  }, [id])

  return { venta, loading, error }
}
