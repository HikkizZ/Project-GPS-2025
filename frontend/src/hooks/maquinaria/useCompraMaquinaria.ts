import { useState, useEffect, useCallback } from "react"
import { compraMaquinariaService } from "../../services/maquinaria/compraMaquinaria.service.js"
import type { CompraMaquinaria, CreateCompraMaquinaria } from "../../types/maquinaria.types"

export const useCompraMaquinaria = () => {
  const [compras, setCompras] = useState<CompraMaquinaria[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCompras = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let response
      try {
        response = await compraMaquinariaService.obtenerTodasLasComprasConInactivas()
      } catch {
        response = await compraMaquinariaService.obtenerTodasLasCompras()
      }

      if (response.success && response.data) {
        setCompras(response.data)
      } else {
        setError(response.message || "Error al obtener compras")
      }
    } catch (err: any) {
      setError(err.message || "Error al obtener compras")
    } finally {
      setLoading(false)
    }
  }, [])

  const crearCompra = useCallback(async (data: CreateCompraMaquinaria, file?: File) => {
    setLoading(true)
    setError(null)
    try {
      const response = await compraMaquinariaService.crearCompra(data, file)
      if (response.success && response.data) {
        setCompras((prev) => [response.data!, ...prev])
        return response.data
      } else {
        setError(response.message || "Error al crear compra")
        throw new Error(response.message || "Error al crear compra")
      }
    } catch (err: any) {
      setError(err.message || "Error al crear compra")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const actualizarCompra = useCallback(async (id: number, data: Partial<CreateCompraMaquinaria>, file?: File) => {
    setLoading(true)
    setError(null)
    try {
      const response = await compraMaquinariaService.actualizarCompra(id, data, file)
      if (response.success && response.data) {
        setCompras((prev) => prev.map((compra) => (compra.id === id ? response.data! : compra)))
        return response.data
      } else {
        setError(response.message || "Error al actualizar compra")
        throw new Error(response.message || "Error al actualizar compra")
      }
    } catch (err: any) {
      setError(err.message || "Error al actualizar compra")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const eliminarPadron = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await compraMaquinariaService.eliminarPadron(id)
      if (response.success && response.data) {
        setCompras((prev) => prev.map((compra) => (compra.id === id ? response.data! : compra)))
        return response.data
      } else {
        setError(response.message || "Error al eliminar padrón")
        throw new Error(response.message || "Error al eliminar padrón")
      }
    } catch (err: any) {
      setError(err.message || "Error al eliminar padrón")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const eliminarCompra = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await compraMaquinariaService.eliminarCompra(id)
      if (response.success) {
        setCompras((prev) => prev.map((compra) => (compra.id === id ? { ...compra, isActive: false } : compra)))
        return true
      } else {
        setError(response.message || "Error al eliminar compra")
        throw new Error(response.message || "Error al eliminar compra")
      }
    } catch (err: any) {
      setError(err.message || "Error al eliminar compra")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const restaurarCompra = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await compraMaquinariaService.restaurarCompra(id)
      if (response.success && response.data) {
        setCompras((prev) => prev.map((compra) => (compra.id === id ? response.data! : compra)))
        return response.data
      } else {
        setError(response.message || "Error al restaurar compra")
        throw new Error(response.message || "Error al restaurar compra")
      }
    } catch (err: any) {
      setError(err.message || "Error al restaurar compra")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCompras()
  }, [fetchCompras])

  return {
    compras,
    loading,
    error,
    crearCompra,
    actualizarCompra,
    eliminarPadron,
    eliminarCompra,
    restaurarCompra,
    refetch: fetchCompras,
  }
}

export const useCompraById = (id: number) => {
  const [compra, setCompra] = useState<CompraMaquinaria | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchCompra = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await compraMaquinariaService.obtenerCompraPorId(id)
        if (response.success && response.data) {
          setCompra(response.data)
        } else {
          setError(response.message || "Error al obtener compra")
        }
      } catch (err: any) {
        setError(err.message || "Error al obtener compra")
      } finally {
        setLoading(false)
      }
    }

    fetchCompra()
  }, [id])

  return { compra, loading, error }
}

export default useCompraMaquinaria
