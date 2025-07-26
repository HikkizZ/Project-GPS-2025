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
    setLoading(true)
    setError(null)
    try {
      const response = await clienteMaquinariaService.obtenerTodosLosClientes()

      if (response.success && response.data) {
        setClientes(response.data)
      } else {
        setError(response.message || "Error al obtener clientes")
      }
    } catch (err: any) {
      setError(err.message || "Error al obtener clientes")
    } finally {
      setLoading(false)
    }
  }, [])

  const crearCliente = useCallback(async (data: CreateClienteMaquinaria) => {
    setLoading(true)
    setError(null)
    try {
      const response = await clienteMaquinariaService.crearCliente(data)
      if (response.success && response.data) {
        setClientes((prev) => {
          const newList = [response.data!, ...prev]
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


  useEffect(() => {
    fetchClientes()
  }, [fetchClientes])

  return {
    clientes,
    loading,
    error,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    buscarClientes,
    refetch: fetchClientes
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


export default useClienteMaquinaria
