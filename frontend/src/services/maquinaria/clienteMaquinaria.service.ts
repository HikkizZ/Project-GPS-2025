import { apiClient } from "../../config/api.config"
import type {
  ClienteMaquinaria,
  CreateClienteMaquinaria,
  ApiResponse,
  EstadisticasClienteMaquinaria,
} from "../../types/arriendoMaquinaria.types"

export class ClienteMaquinariaService {
  private baseURL = "/clientes-maquinaria"

  async crearCliente(data: CreateClienteMaquinaria): Promise<ApiResponse<ClienteMaquinaria>> {
    try {
      console.log("🔄 Creando cliente:", data)
      const response = await apiClient.post(`${this.baseURL}/`, data)
      console.log("✅ Cliente creado exitosamente:", response.data)

      return {
        success: true,
        message: "Cliente creado exitosamente",
        data: response.data.data,
      }
    } catch (error: any) {
      console.error("❌ Error al crear cliente:", error)
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al crear el cliente",
      }
    }
  }

  async obtenerTodosLosClientes(): Promise<ApiResponse<ClienteMaquinaria[]>> {
    try {
      console.log("🔄 Obteniendo todos los clientes...")
      const response = await apiClient.get(`${this.baseURL}/`)
      console.log("✅ Respuesta completa del backend:", response.data)

      // CORREGIDO: El backend devuelve directamente los datos o con estructura { success, data }
      let clientes: ClienteMaquinaria[] = []

      if (Array.isArray(response.data)) {
        // Si la respuesta es directamente un array
        clientes = response.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // Si la respuesta tiene estructura { success, data }
        clientes = response.data.data
      } else if (response.data.success && Array.isArray(response.data.data)) {
        // Otra posible estructura
        clientes = response.data.data
      }

      console.log("📊 Clientes procesados:", clientes)

      return {
        success: true,
        message: "Clientes obtenidos exitosamente",
        data: clientes,
      }
    } catch (error: any) {
      console.error("❌ Error al obtener clientes:", error)
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al obtener los clientes",
      }
    }
  }

  async obtenerClientePorId(id: number): Promise<ApiResponse<ClienteMaquinaria>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/${id}`)
      return {
        success: true,
        message: "Cliente obtenido exitosamente",
        data: response.data.data || response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al obtener el cliente",
      }
    }
  }

  async obtenerClientePorRut(rut: string): Promise<ApiResponse<ClienteMaquinaria>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/rut/${rut}`)
      return {
        success: true,
        message: "Cliente obtenido exitosamente",
        data: response.data.data || response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al obtener el cliente",
      }
    }
  }

  async buscarClientesPorNombre(nombre: string): Promise<ApiResponse<ClienteMaquinaria[]>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/search`, {
        params: { nombre },
      })

      let clientes: ClienteMaquinaria[] = []

      if (Array.isArray(response.data)) {
        clientes = response.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        clientes = response.data.data
      }

      return {
        success: true,
        message: "Búsqueda completada exitosamente",
        data: clientes,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error en la búsqueda",
      }
    }
  }

  async actualizarCliente(id: number, data: Partial<CreateClienteMaquinaria>): Promise<ApiResponse<ClienteMaquinaria>> {
    try {
      const response = await apiClient.put(`${this.baseURL}/${id}`, data)
      return {
        success: true,
        message: "Cliente actualizado exitosamente",
        data: response.data.data || response.data,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al actualizar el cliente",
      }
    }
  }

  async eliminarCliente(id: number): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`${this.baseURL}/${id}`)
      return {
        success: true,
        message: "Cliente eliminado exitosamente",
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al eliminar el cliente",
      }
    }
  }

  async obtenerEstadisticas(): Promise<ApiResponse<EstadisticasClienteMaquinaria>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/stats`)
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

export const clienteMaquinariaService = new ClienteMaquinariaService()

// Exportar funciones individuales para facilitar el uso
export const crearCliente = (data: CreateClienteMaquinaria) => clienteMaquinariaService.crearCliente(data)
export const obtenerTodosLosClientes = () => clienteMaquinariaService.obtenerTodosLosClientes()
export const obtenerClientePorId = (id: number) => clienteMaquinariaService.obtenerClientePorId(id)
export const obtenerClientePorRut = (rut: string) => clienteMaquinariaService.obtenerClientePorRut(rut)
export const actualizarCliente = (id: number, data: Partial<CreateClienteMaquinaria>) =>
  clienteMaquinariaService.actualizarCliente(id, data)
export const eliminarCliente = (id: number) => clienteMaquinariaService.eliminarCliente(id)
