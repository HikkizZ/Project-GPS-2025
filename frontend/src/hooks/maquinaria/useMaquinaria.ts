"use client"

import { useState, useEffect, useCallback } from "react"
import { maquinariaService } from "../../services/maquinaria/maquinaria.service.js"
import type { Maquinaria } from "../../types/maquinaria.types"

export const useMaquinaria = () => {
  const [maquinarias, setMaquinarias] = useState<Maquinaria[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMaquinarias = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await maquinariaService.obtenerTodasLasMaquinarias()
      if (response.success && response.data) {
        setMaquinarias(response.data)
      } else {
        setError(response.message)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const actualizarKilometraje = useCallback(async (id: number, kilometraje: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await maquinariaService.actualizarKilometraje(id, kilometraje)
      if (response.success && response.data) {
        setMaquinarias((prev) => prev.map((maq) => (maq.id === id ? response.data! : maq)))
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

  const cambiarEstado = useCallback(async (id: number, estado: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await maquinariaService.cambiarEstado(id, estado)
      if (response.success && response.data) {
        setMaquinarias((prev) => prev.map((maq) => (maq.id === id ? response.data! : maq)))
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

  useEffect(() => {
    fetchMaquinarias()
  }, [fetchMaquinarias])

  return {
    maquinarias,
    loading,
    error,
    actualizarKilometraje,
    cambiarEstado,
    refetch: fetchMaquinarias,
  }
}

export const useMaquinariaById = (id: number) => {
  const [maquinaria, setMaquinaria] = useState<Maquinaria | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchMaquinaria = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await maquinariaService.obtenerMaquinariaPorId(id)
        if (response.success && response.data) {
          setMaquinaria(response.data)
        } else {
          setError(response.message)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMaquinaria()
  }, [id])

  return { maquinaria, loading, error }
}
