import { apiClient } from "../../config/api.config"
import type { CompraMaquinaria, CreateCompraMaquinaria } from "../../types/maquinaria.types"

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

export class CompraMaquinariaService {
  private baseURL = "/compra-maquinaria"

  async crearCompra(data: CreateCompraMaquinaria, file?: File): Promise<ApiResponse<CompraMaquinaria>> {
    try {
      const formData = new FormData()

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString())
        }
      })

      if (file) {
        formData.append("padron", file)
      }

      const response = await apiClient.post(`${this.baseURL}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      return {
        success: true,
        message: "Compra creada exitosamente",
        data: response.data,
      }
    } catch (error: any) {
      console.error("Error al crear compra:", error)
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al crear la compra",
      }
    }
  }

  async obtenerTodasLasCompras(): Promise<ApiResponse<CompraMaquinaria[]>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/`)
      return {
        success: true,
        message: "Compras obtenidas exitosamente",
        data: response.data || [],
      }
    } catch (error: any) {
      console.error("Error al obtener compras:", error)
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al obtener las compras",
      }
    }
  }

  async obtenerTodasLasComprasConInactivas(): Promise<ApiResponse<CompraMaquinaria[]>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/`, {
        params: { incluirInactivas: true },
      })
      return {
        success: true,
        message: "Compras obtenidas exitosamente",
        data: response.data?.data || response.data || [],
      }
    } catch (error: any) {
      console.error("Error al obtener compras:", error)
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al obtener las compras",
      }
    }
  }

  async obtenerCompraPorId(id: number): Promise<ApiResponse<CompraMaquinaria>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/${id}`)
      return {
        success: true,
        message: "Compra obtenida exitosamente",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al obtener la compra",
      }
    }
  }

  async obtenerComprasPorMaquinaria(maquinariaId: number): Promise<ApiResponse<CompraMaquinaria[]>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/maquinaria/${maquinariaId}`)
      return {
        success: true,
        message: "Compras por maquinaria obtenidas exitosamente",
        data: response.data || [],
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al obtener compras por maquinaria",
      }
    }
  }

  async obtenerComprasPorFecha(fechaInicio: string, fechaFin: string): Promise<ApiResponse<CompraMaquinaria[]>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/fecha`, {
        params: { fechaInicio, fechaFin },
      })
      return {
        success: true,
        message: "Compras por fecha obtenidas exitosamente",
        data: response.data || [],
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al obtener compras por fecha",
      }
    }
  }

  async obtenerTotalCompras(fechaInicio: string, fechaFin: string): Promise<ApiResponse<{ total: number }>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/total`, {
        params: { fechaInicio, fechaFin },
      })
      return {
        success: true,
        message: "Total de compras obtenido exitosamente",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al obtener total de compras",
      }
    }
  }

  async actualizarCompra(
    id: number,
    data: Partial<CreateCompraMaquinaria>,
    file?: File,
  ): Promise<ApiResponse<CompraMaquinaria>> {
    try {
      const formData = new FormData()

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString())
        }
      })

      if (file) {
        formData.append("padron", file)
      }

      const response = await apiClient.put(`${this.baseURL}/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return {
        success: true,
        message: "Compra actualizada exitosamente",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al actualizar la compra",
      }
    }
  }
  async eliminarPadron(id: number): Promise<ApiResponse<CompraMaquinaria>> {
    try {
      const response = await apiClient.delete(`${this.baseURL}/${id}/padron`)
      return {
        success: true,
        message: "Padrón eliminado exitosamente",
        data: response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al eliminar el padrón",
      }
    }
  }

  // NUEVOS MÉTODOS PARA SOFT DELETE
  async eliminarCompra(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`${this.baseURL}/${id}`)
      return {
        success: true,
        message: "Compra eliminada exitosamente (soft delete)",
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al eliminar la compra",
      }
    }
  }

  async restaurarCompra(id: number): Promise<ApiResponse<CompraMaquinaria>> {
    try {
      const response = await apiClient.patch(`${this.baseURL}/${id}/restaurar`)
      return {
        success: true,
        message: "Compra restaurada exitosamente",
        data: response.data?.data || response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al restaurar la compra",
      }
    }
  }
}
export const compraMaquinariaService = new CompraMaquinariaService()
export const crearCompra = (data: CreateCompraMaquinaria, file?: File) =>
  compraMaquinariaService.crearCompra(data, file)
export const obtenerTodasLasCompras = () => compraMaquinariaService.obtenerTodasLasCompras()
export const obtenerCompraPorId = (id: number) => compraMaquinariaService.obtenerCompraPorId(id)
export const actualizarCompra = (id: number, data: Partial<CreateCompraMaquinaria>, file?: File) =>
  compraMaquinariaService.actualizarCompra(id, data, file)
export const eliminarPadron = (id: number) => compraMaquinariaService.eliminarPadron(id)
export const eliminarCompra = (id: number) => compraMaquinariaService.eliminarCompra(id)
export const restaurarCompra = (id: number) => compraMaquinariaService.restaurarCompra(id)
