import { apiClient } from "../../config/api.config"
import type {
  ArriendoMaquinaria,
  CreateArriendoMaquinaria,
  Maquinaria,
  ClienteMaquinaria,
  ApiResponse,
} from "../../types/arriendoMaquinaria.types"

export class ArriendoMaquinariaService {
  private baseURL = "/arriendos-maquinaria"

  async crearReporteTrabajo(data: CreateArriendoMaquinaria): Promise<ApiResponse<ArriendoMaquinaria>> {
    try {
      const response = await apiClient.post(`${this.baseURL}/`, data)
      return {
        success: true,
        message: "Reporte de trabajo creado exitosamente",
        data: response.data.data || response.data,
      }
    } catch (error: any) {
      let errorMessage = "Error al crear el reporte de trabajo"

      if (error.response?.data) {
        const errorData = error.response.data
        if (typeof errorData === "string") {
          errorMessage = errorData
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      if (error.response?.status === 409) {
        if (errorMessage.includes("SuperAdministrador")) {
          errorMessage = "⚠️ " + errorMessage
        } else {
          // Error genérico de duplicado
          errorMessage = "❌ " + errorMessage
        }
      }

      return {
        success: false,
        message: errorMessage,
      }
    }
  }
  //todos los reports
  async obtenerTodosLosReportesSinPaginacion(): Promise<ApiResponse<ArriendoMaquinaria[]>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/`)
      return {
        success: true,
        message: "Reportes obtenidos exitosamente",
        data: response.data || [],
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al obtener los reportes",
        data: [],
      }
    }
  }

  // NUEVA FUNCIÓN PARA OBTENER CON INACTIVAS (como en compras)
  async obtenerTodosLosReportesConInactivas(): Promise<ApiResponse<ArriendoMaquinaria[]>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/`, {
        params: { incluirInactivas: true },
      })
      return {
        success: true,
        message: "Reportes obtenidos exitosamente",
        data: response.data?.data || response.data || [],
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al obtener los reportes",
        data: [],
      }
    }
  }

  async obtenerReportePorId(id: number): Promise<ApiResponse<ArriendoMaquinaria>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/${id}`)
      return {
        success: true,
        message: "Reporte obtenido exitosamente",
        data: response.data.data || response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al obtener el reporte",
      }
    }
  }

  async obtenerMaquinariasDisponibles(): Promise<ApiResponse<Maquinaria[]>> {
    try {
      const response = await apiClient.get("/maquinaria", {
        params: { estado: "disponible" },
      })

      let maquinarias: Maquinaria[] = []

      if (Array.isArray(response.data)) {
        maquinarias = response.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        maquinarias = response.data.data
      }

      return {
        success: true,
        message: "Maquinarias disponibles obtenidas exitosamente",
        data: maquinarias,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al obtener maquinarias disponibles",
        data: [],
      }
    }
  }

  async obtenerClientesMaquinaria(): Promise<ApiResponse<ClienteMaquinaria[]>> {
    try {
      const response = await apiClient.get("/clientes-maquinaria/")

      let clientes: ClienteMaquinaria[] = []

      if (Array.isArray(response.data)) {
        clientes = response.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        clientes = response.data.data
      } else if (response.data.success && Array.isArray(response.data.data)) {
        clientes = response.data.data
      }

      return {
        success: true,
        message: "Clientes obtenidos exitosamente",
        data: clientes,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al obtener clientes",
        data: [],
      }
    }
  }

  async actualizarReporte(
    id: number,
    data: Partial<CreateArriendoMaquinaria>,
  ): Promise<ApiResponse<ArriendoMaquinaria>> {
    try {
      const response = await apiClient.put(`${this.baseURL}/${id}`, data)
      return {
        success: true,
        message: "Reporte actualizado exitosamente",
        data: response.data.data || response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al actualizar el reporte",
      }
    }
  }

  async eliminarReporte(id: number): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`${this.baseURL}/${id}`)
      return {
        success: true,
        message: "Reporte eliminado exitosamente (soft delete)",
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al eliminar el reporte",
      }
    }
  }

  async restaurarReporte(id: number): Promise<ApiResponse<ArriendoMaquinaria>> {
    try {
      const response = await apiClient.patch(`${this.baseURL}/${id}/restaurar`)
      return {
        success: true,
        message: "Reporte restaurado exitosamente",
        data: response.data.data || response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al restaurar el reporte",
      }
    }
  }
}

export const arriendoMaquinariaService = new ArriendoMaquinariaService()

export const crearReporteTrabajo = (data: CreateArriendoMaquinaria) =>
  arriendoMaquinariaService.crearReporteTrabajo(data)
export const obtenerTodosLosReportes = () => arriendoMaquinariaService.obtenerTodosLosReportesSinPaginacion()
export const obtenerReportePorId = (id: number) => arriendoMaquinariaService.obtenerReportePorId(id)
export const actualizarReporte = (id: number, data: Partial<CreateArriendoMaquinaria>) =>
  arriendoMaquinariaService.actualizarReporte(id, data)
export const eliminarReporte = (id: number) => arriendoMaquinariaService.eliminarReporte(id)
export const restaurarReporte = (id: number) => arriendoMaquinariaService.restaurarReporte(id)
