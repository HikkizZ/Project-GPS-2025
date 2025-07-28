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

  async descargarPadron(id: number): Promise<void> {
    try {
      console.log(`Iniciando descarga de padrón para maquinaria ID: ${id}`)

      const response = await apiClient.get(`${this.baseURL}/${id}/padron`, {
        responseType: "blob",
        timeout: 30000,
      })

      console.log("Respuesta completa:", response)
      console.log("Tipo de respuesta:", typeof response)
      console.log("Es Blob directamente:", response instanceof Blob)

      // Determinar si la respuesta es directamente un Blob o tiene estructura de respuesta
      let blob: Blob
      let headers: any = {}

      if (response instanceof Blob) {
        // La respuesta es directamente un Blob
        console.log("Respuesta es Blob directo")
        blob = response
      } else if (response && typeof response === "object") {
        // La respuesta tiene estructura (response.data, response.headers, etc.)
        console.log("Respuesta tiene estructura")
        console.log("response.data:", response.data)
        console.log("response.headers:", response.headers)
        console.log("response.status:", response.status)

        if (response.data instanceof Blob) {
          blob = response.data
        } else if (response.data instanceof ArrayBuffer) {
          blob = new Blob([response.data], { type: "application/pdf" })
        } else if (response.data) {
          blob = new Blob([response.data], { type: "application/pdf" })
        } else {
          throw new Error("No se recibieron datos válidos del servidor")
        }

        headers = response.headers || {}
      } else {
        throw new Error("Respuesta inválida del servidor")
      }

      console.log("Blob final:", blob)
      console.log("Tamaño del blob:", blob.size, "bytes")

      // Verificar que el blob tenga contenido
      if (blob.size === 0) {
        throw new Error("El archivo descargado está vacío")
      }

      // Obtener el nombre del archivo
      let filename = `padron_maquinaria_${id}.pdf`

      try {
        const contentDisposition =
          headers["content-disposition"] || headers["Content-Disposition"] || headers.contentDisposition

        if (contentDisposition) {
          console.log("Content-Disposition header:", contentDisposition)

          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, "")
            console.log("Filename extraído:", filename)
          }
        }
      } catch (headerError) {
        console.warn("Error al procesar headers:", headerError)
      }

      // Crear y ejecutar la descarga
      console.log("Creando descarga con filename:", filename)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      link.style.display = "none"

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Limpiar el URL
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 100)

      console.log("Descarga completada exitosamente")
    } catch (error: any) {
      console.error("Error completo al descargar:", error)
      console.error("Error stack:", error.stack)

      // Manejar diferentes tipos de errores
      if (error.code === "ECONNABORTED") {
        throw new Error("Tiempo de espera agotado. Intenta nuevamente.")
      }

      if (error.response) {
        console.error("Error response:", error.response)
        const status = error.response.status || error.response.statusCode

        if (status === 404) {
          throw new Error("Padrón no encontrado")
        } else if (status === 500) {
          throw new Error("Error interno del servidor")
        } else {
          throw new Error(`Error del servidor: ${status}`)
        }
      }

      if (error.request) {
        console.error("Error request:", error.request)
        throw new Error("No se pudo conectar con el servidor")
      }

      throw new Error(error.message || "Error desconocido al descargar el padrón")
    }
  }
}

// Instancia exportada del servicio
export const maquinariaService = new MaquinariaService()

// Exports de funciones individuales para compatibilidad
export const obtenerTodasLasMaquinarias = () => maquinariaService.obtenerTodasLasMaquinarias()
export const obtenerMaquinariaPorId = (id: number) => maquinariaService.obtenerMaquinariaPorId(id)
export const obtenerMaquinariaDisponible = () => maquinariaService.obtenerMaquinariaDisponible()
export const actualizarKilometraje = (id: number, kilometraje: number) =>
  maquinariaService.actualizarKilometraje(id, kilometraje)
export const cambiarEstado = (id: number, estado: string) => maquinariaService.cambiarEstado(id, estado)
export const descargarPadron = (id: number) => maquinariaService.descargarPadron(id)
