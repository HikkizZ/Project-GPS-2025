import { apiClient } from "@/config/api.config"
import type { VentaMaquinaria, CreateVentaMaquinaria } from "../../types/maquinaria.types"

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

export class VentaMaquinariaService {
  private baseURL = "/ventas-maquinaria"

  async registrarVenta(data: CreateVentaMaquinaria): Promise<ApiResponse<VentaMaquinaria>> {
    try {
      const response = await apiClient.post(`${this.baseURL}/`, data)
      return {
        success: true,
        message: "Venta registrada exitosamente",
        data: response.data,
      }
    } catch (error: any) {
      console.error("Error al registrar venta:", error)
      return {
        success: false,
        message: error.message || "Error al registrar la venta",
      }
    }
  }

  async obtenerTodasLasVentas(): Promise<ApiResponse<VentaMaquinaria[]>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/`)
      return {
        success: true,
        message: "Ventas obtenidas exitosamente",
        data: response.data || [],
      }
    } catch (error: any) {
      console.error("Error al obtener ventas:", error)
      return {
        success: false,
        message: error.message || "Error al obtener las ventas",
      }
    }
  }

  async obtenerVentaPorId(id: number): Promise<ApiResponse<VentaMaquinaria>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/${id}`)
      return {
        success: true,
        message: "Venta obtenida exitosamente",
        data: response.data,
      }
    } catch (error: any) {
      console.error("Error al obtener venta:", error)
      return {
        success: false,
        message: error.message || "Error al obtener la venta",
      }
    }
  }

  async obtenerVentasPorMaquinaria(maquinariaId: number): Promise<ApiResponse<VentaMaquinaria[]>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/maquinaria/${maquinariaId}`)
      return {
        success: true,
        message: "Ventas por maquinaria obtenidas exitosamente",
        data: response.data || [],
      }
    } catch (error: any) {
      console.error("Error al obtener ventas por maquinaria:", error)
      return {
        success: false,
        message: error.message || "Error al obtener ventas por maquinaria",
      }
    }
  }

  async obtenerVentasPorFecha(fechaInicio: string, fechaFin: string): Promise<ApiResponse<VentaMaquinaria[]>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/fecha`, {
        params: { fechaInicio, fechaFin },
      })
      return {
        success: true,
        message: "Ventas por fecha obtenidas exitosamente",
        data: response.data || [],
      }
    } catch (error: any) {
      console.error("Error al obtener ventas por fecha:", error)
      return {
        success: false,
        message: error.message || "Error al obtener ventas por fecha",
      }
    }
  }

  async obtenerTotalVentas(fechaInicio: string, fechaFin: string): Promise<ApiResponse<{ total: number }>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/total`, {
        params: { fechaInicio, fechaFin },
      })
      return {
        success: true,
        message: "Total de ventas obtenido exitosamente",
        data: response.data,
      }
    } catch (error: any) {
      console.error("Error al obtener total de ventas:", error)
      return {
        success: false,
        message: error.message || "Error al obtener total de ventas",
      }
    }
  }

  async actualizarVenta(id: number, data: Partial<CreateVentaMaquinaria>): Promise<ApiResponse<VentaMaquinaria>> {
    try {
      const response = await apiClient.put(`${this.baseURL}/${id}`, data)
      return {
        success: true,
        message: "Venta actualizada exitosamente",
        data: response.data,
      }
    } catch (error: any) {
      console.error("Error al actualizar venta:", error)
      return {
        success: false,
        message: error.message || "Error al actualizar la venta",
      }
    }
  }

  async eliminarVenta(id: number): Promise<ApiResponse> {
    try {
      await apiClient.delete(`${this.baseURL}/${id}`)
      return {
        success: true,
        message: "Venta eliminada exitosamente",
      }
    } catch (error: any) {
      console.error("Error al eliminar venta:", error)
      return {
        success: false,
        message: error.message || "Error al eliminar la venta",
      }
    }
  }
}

export const ventaMaquinariaService = new VentaMaquinariaService()

// Funciones de conveniencia para uso directo
export const registrarVenta = (data: CreateVentaMaquinaria) => ventaMaquinariaService.registrarVenta(data)
export const obtenerTodasLasVentas = () => ventaMaquinariaService.obtenerTodasLasVentas()
export const obtenerVentaPorId = (id: number) => ventaMaquinariaService.obtenerVentaPorId(id)
export const actualizarVenta = (id: number, data: Partial<CreateVentaMaquinaria>) =>
  ventaMaquinariaService.actualizarVenta(id, data)
export const eliminarVenta = (id: number) => ventaMaquinariaService.eliminarVenta(id)
