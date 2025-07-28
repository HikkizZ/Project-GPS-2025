import { apiClient } from "@/config/api.config"
import type { Maquinaria } from "../../types/maquinaria.types"

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

export class MaquinariaService {
  private baseURL = "/maquinaria"

  async obtenerTodasLasMaquinarias(): Promise<ApiResponse<Maquinaria[]>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/?includeRelations=true`)
      return {
        success: true,
        message: "Maquinarias obtenidas exitosamente",
        data: response.data || [],
      }
    } catch (error: any) {
      console.error("Error al obtener maquinarias:", error)
      return {
        success: false,
        message: error.message || "Error al obtener las maquinarias",
      }
    }
  }

  async obtenerMaquinariaPorId(id: number): Promise<ApiResponse<Maquinaria>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/${id}`)
      return {
        success: true,
        message: "Maquinaria obtenida exitosamente",
        data: response.data,
      }
    } catch (error: any) {
      console.error("Error al obtener maquinaria:", error)
      return {
        success: false,
        message: error.message || "Error al obtener la maquinaria",
      }
    }
  }

  async obtenerMaquinariaDisponible(): Promise<ApiResponse<Maquinaria[]>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/disponible`)
      return {
        success: true,
        message: "Maquinaria disponible obtenida exitosamente",
        data: response.data || [],
      }
    } catch (error: any) {
      console.error("Error al obtener maquinaria disponible:", error)
      return {
        success: false,
        message: error.message || "Error al obtener maquinaria disponible",
      }
    }
  }

  async obtenerMaquinariaPorGrupo(grupo: string): Promise<ApiResponse<Maquinaria[]>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/grupo/${grupo}`)
      return {
        success: true,
        message: "Maquinaria por grupo obtenida exitosamente",
        data: response.data || [],
      }
    } catch (error: any) {
      console.error("Error al obtener maquinaria por grupo:", error)
      return {
        success: false,
        message: error.message || "Error al obtener maquinaria por grupo",
      }
    }
  }

  async actualizarKilometraje(id: number, nuevoKilometraje: number): Promise<ApiResponse<Maquinaria>> {
    try {
      const response = await apiClient.patch(`${this.baseURL}/${id}/kilometraje`, {
        kilometrajeActual: nuevoKilometraje,
      })
      return {
        success: true,
        message: "Kilometraje actualizado exitosamente",
        data: response.data,
      }
    } catch (error: any) {
      console.error("Error al actualizar kilometraje:", error)
      return {
        success: false,
        message: error.message || "Error al actualizar kilometraje",
      }
    }
  }

  async cambiarEstado(id: number, nuevoEstado: string): Promise<ApiResponse<Maquinaria>> {
    try {
      const response = await apiClient.patch(`${this.baseURL}/${id}/estado`, {
        estado: nuevoEstado,
      })
      return {
        success: true,
        message: "Estado actualizado exitosamente",
        data: response.data,
      }
    } catch (error: any) {
      console.error("Error al cambiar estado:", error)
      return {
        success: false,
        message: error.message || "Error al cambiar estado",
      }
    }
  }
}

export const maquinariaService = new MaquinariaService()
export const obtenerTodasLasMaquinarias = () => maquinariaService.obtenerTodasLasMaquinarias()
export const obtenerMaquinariaPorId = (id: number) => maquinariaService.obtenerMaquinariaPorId(id)
export const obtenerMaquinariaDisponible = () => maquinariaService.obtenerMaquinariaDisponible()
export const actualizarKilometraje = (id: number, kilometraje: number) =>
  maquinariaService.actualizarKilometraje(id, kilometraje)
export const cambiarEstado = (id: number, estado: string) => maquinariaService.cambiarEstado(id, estado)
