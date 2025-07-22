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
      console.error("Error al crear reporte:", error)
      console.error("Error response:", error.response?.data)
      console.error("Error status:", error.response?.status)

      let errorMessage = "Error al crear el reporte de trabajo"

      if (error.response?.data) {
        const errorData = error.response.data

        if (typeof errorData === "string") {
          errorMessage = errorData
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        } else if (errorData.details) {
          errorMessage = `Errores de validación: ${JSON.stringify(errorData.details)}`
        } else {
          errorMessage = `Error ${error.response.status}: ${JSON.stringify(errorData)}`
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      return {
        success: false,
        message: errorMessage,
      }
    }
  }

  async obtenerTodosLosReportes(): Promise<ApiResponse<ArriendoMaquinaria[]>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/`)
      return {
        success: true,
        message: "Reportes obtenidos exitosamente",
        data: response.data.data || response.data || [],
      }
    } catch (error: any) {
      console.error("Error al obtener reportes:", error)
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
      console.error("Error al obtener maquinarias:", error)
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
      console.error("Error al obtener clientes:", error)
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al obtener clientes",
        data: [],
      }
    }
  }

  async obtenerReportesPorPatente(patente: string): Promise<ApiResponse<ArriendoMaquinaria[]>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/patente/${patente}`)
      return {
        success: true,
        message: "Reportes por patente obtenidos exitosamente",
        data: response.data.data || response.data || [],
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al obtener reportes por patente",
        data: [],
      }
    }
  }

  async obtenerReportesPorCliente(rutCliente: string): Promise<ApiResponse<ArriendoMaquinaria[]>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/cliente/${rutCliente}`)
      return {
        success: true,
        message: "Reportes por cliente obtenidos exitosamente",
        data: response.data.data || response.data || [],
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al obtener reportes por cliente",
        data: [],
      }
    }
  }

  async obtenerReportesPorObra(obra: string): Promise<ApiResponse<ArriendoMaquinaria[]>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/obra/${obra}`)
      return {
        success: true,
        message: "Reportes por obra obtenidos exitosamente",
        data: response.data.data || response.data || [],
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al obtener reportes por obra",
        data: [],
      }
    }
  }

  async obtenerReportesPorFecha(fecha: string): Promise<ApiResponse<ArriendoMaquinaria[]>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/fecha/${fecha}`)
      return {
        success: true,
        message: "Reportes por fecha obtenidos exitosamente",
        data: response.data.data || response.data || [],
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al obtener reportes por fecha",
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
        message: "Reporte eliminado exitosamente",
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al eliminar el reporte",
      }
    }
  }

  async obtenerIngresosPorPeriodo(fechaInicio: string, fechaFin: string): Promise<ApiResponse<{ ingresos: number }>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/ingresos`, {
        params: { fechaInicio, fechaFin },
      })
      return {
        success: true,
        message: "Ingresos obtenidos exitosamente",
        data: response.data.data || response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al obtener ingresos",
      }
    }
  }

  async obtenerEstadisticasPorMaquinaria(patente: string): Promise<
    ApiResponse<{
      totalReportes: number
      totalIngresos: number
      kilometrajeRecorrido: number
      ultimoReporte: string | null
      kilometrajeActual: number
    }>
  > {
    try {
      const response = await apiClient.get(`${this.baseURL}/estadisticas/${patente}`)
      return {
        success: true,
        message: "Estadísticas obtenidas exitosamente",
        data: response.data.data || response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al obtener estadísticas",
      }
    }
  }
}

export const arriendoMaquinariaService = new ArriendoMaquinariaService()

export const crearReporteTrabajo = (data: CreateArriendoMaquinaria) =>
  arriendoMaquinariaService.crearReporteTrabajo(data)
export const obtenerTodosLosReportes = () => arriendoMaquinariaService.obtenerTodosLosReportes()
export const obtenerReportePorId = (id: number) => arriendoMaquinariaService.obtenerReportePorId(id)
export const actualizarReporte = (id: number, data: Partial<CreateArriendoMaquinaria>) =>
  arriendoMaquinariaService.actualizarReporte(id, data)
export const eliminarReporte = (id: number) => arriendoMaquinariaService.eliminarReporte(id)
