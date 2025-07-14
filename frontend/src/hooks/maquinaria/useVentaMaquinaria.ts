"use client"

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
      const response = await ventaMaquinariaService.obtenerTodasLasVentas()
      if (response.success && response.data) {
        setVentas(response.data)
      } else {
        setError(response.message)
      }
    } catch (err: any) {
      setError(err.message)
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
        setError(response.message)
        throw new Error(response.message)
      }
    } catch (err: any) {
      setError(err.message)
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
        setError(response.message)
        throw new Error(response.message)
      }
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const eliminarVenta = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await ventaMaquinariaService.eliminarVenta(id)
      if (response.success) {
        setVentas((prev) => prev.filter((venta) => venta.id !== id))
      } else {
        setError(response.message)
        throw new Error(response.message)
      }
    } catch (err: any) {
      setError(err.message)
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
          setError(response.message)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchVenta()
  }, [id])

  return { venta, loading, error }
}
