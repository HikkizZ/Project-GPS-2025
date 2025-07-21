"use client"

import { useState, useEffect, useCallback } from "react"
import { clienteMaquinariaService } from "../../services/maquinaria/clienteMaquinaria.service"
import type {
  ClienteMaquinaria,
  CreateClienteMaquinaria,
  EstadisticasClienteMaquinaria,
} from "../../types/arriendoMaquinaria.types"

export const useClienteMaquinaria = () => {
  const [clientes, setClientes] = useState<ClienteMaquinaria[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchClientes = useCallback(async () => {
    console.log("🔄 Hook: Iniciando fetchClientes...")
    setLoading(true)
    setError(null)
    try {
      const response = await clienteMaquinariaService.obtenerTodosLosClientes()
      console.log("📊 Hook: Respuesta del servicio:", response)

      if (response.success && response.data) {
        console.log("✅ Hook: Datos válidos recibidos:", response.data)
        console.log("🔍 Hook: Tipo de datos:", typeof response.data, Array.isArray(response.data))
        console.log("📋 Hook: Primer cliente:", response.data[0])

        setClientes(response.data)
        console.log("💾 Hook: Estado actualizado con", response.data.length, "clientes")
      } else {
        console.log("⚠️ Hook: Error en respuesta:", response.message)
        setError(response.message || "Error al obtener clientes")
      }
    } catch (err: any) {
      console.error("❌ Hook: Error en fetchClientes:", err)
      setError(err.message || "Error al obtener clientes")
    } finally {
      setLoading(false)
    }
  }, [])

  const crearCliente = useCallback(async (data: CreateClienteMaquinaria) => {
    console.log("🔄 Hook: Creando cliente:", data)
    setLoading(true)
    setError(null)
    try {
      const response = await clienteMaquinariaService.crearCliente(data)
      if (response.success && response.data) {
        console.log("✅ Hook: Cliente creado, actualizando lista...")
        setClientes((prev) => {
          const newList = [response.data!, ...prev]
          console.log("📋 Hook: Nueva lista de clientes:", newList.length)
          return newList
        })
        return response.data
      } else {
        setError(response.message || "Error al crear cliente")
        throw new Error(response.message || "Error al crear cliente")
      }
    } catch (err: any) {
      setError(err.message || "Error al crear cliente")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const actualizarCliente = useCallback(async (id: number, data: Partial<CreateClienteMaquinaria>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await clienteMaquinariaService.actualizarCliente(id, data)
      if (response.success && response.data) {
        setClientes((prev) => prev.map((cliente) => (cliente.id === id ? response.data! : cliente)))
        return response.data
      } else {
        setError(response.message || "Error al actualizar cliente")
        throw new Error(response.message || "Error al actualizar cliente")
      }
    } catch (err: any) {
      setError(err.message || "Error al actualizar cliente")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const eliminarCliente = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await clienteMaquinariaService.eliminarCliente(id)
      if (response.success) {
        setClientes((prev) => prev.filter((cliente) => cliente.id !== id))
      } else {
        setError(response.message || "Error al eliminar cliente")
        throw new Error(response.message || "Error al eliminar cliente")
      }
    } catch (err: any) {
      setError(err.message || "Error al eliminar cliente")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const buscarClientes = useCallback(async (nombre: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await clienteMaquinariaService.buscarClientesPorNombre(nombre)
      if (response.success && response.data) {
        setClientes(response.data)
      } else {
        setError(response.message || "Error en la búsqueda")
      }
    } catch (err: any) {
      setError(err.message || "Error en la búsqueda")
    } finally {
      setLoading(false)
    }
  }, [])

  const refetchEstadisticas = useCallback(async () => {
    try {
      await clienteMaquinariaService.obtenerEstadisticas()
    } catch (error) {
      console.error("Error al refetch estadísticas:", error)
    }
  }, [])

  useEffect(() => {
    console.log("🚀 Hook: useEffect ejecutándose...")
    fetchClientes()
  }, [fetchClientes])

  // Log adicional para monitorear cambios en el estado
  useEffect(() => {
    console.log("🔄 Hook: Estado de clientes cambió:", clientes.length, "clientes")
    console.log("📋 Hook: Lista actual:", clientes)
  }, [clientes])

  return {
    clientes,
    loading,
    error,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    buscarClientes,
    refetch: fetchClientes,
    refetchEstadisticas,
  }
}

export const useClienteById = (id: number) => {
  const [cliente, setCliente] = useState<ClienteMaquinaria | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchCliente = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await clienteMaquinariaService.obtenerClientePorId(id)
        if (response.success && response.data) {
          setCliente(response.data)
        } else {
          setError(response.message || "Error al obtener cliente")
        }
      } catch (err: any) {
        setError(err.message || "Error al obtener cliente")
      } finally {
        setLoading(false)
      }
    }

    fetchCliente()
  }, [id])

  return { cliente, loading, error }
}

export const useEstadisticasClientes = () => {
  const [estadisticas, setEstadisticas] = useState<EstadisticasClienteMaquinaria | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEstadisticas = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await clienteMaquinariaService.obtenerEstadisticas()
      if (response.success && response.data) {
        setEstadisticas(response.data)
      } else {
        setError(response.message || "Error al obtener estadísticas")
      }
    } catch (err: any) {
      setError(err.message || "Error al obtener estadísticas")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEstadisticas()
  }, [fetchEstadisticas])

  return { estadisticas, loading, error, refetch: fetchEstadisticas }
}

export default useClienteMaquinaria
