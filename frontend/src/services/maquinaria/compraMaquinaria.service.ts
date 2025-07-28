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

  async descargarPadron(id: number): Promise<void> {
    try {
      console.log(`Iniciando descarga de padrón para compra ID: ${id}`)

      const response = await apiClient.get(`${this.baseURL}/${id}/padron`, {
        responseType: "blob",
        timeout: 30000,
      })

      console.log("Respuesta completa:", response)
      console.log("Tipo de respuesta:", typeof response)
      console.log("Es Blob directamente:", response instanceof Blob)
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
      let filename = `padron_compra_${id}.pdf`

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

// Instancia exportada del servicio
export const compraMaquinariaService = new CompraMaquinariaService()

// Exports de funciones individuales para compatibilidad
export const crearCompra = (data: CreateCompraMaquinaria, file?: File) =>
  compraMaquinariaService.crearCompra(data, file)
export const obtenerTodasLasCompras = () => compraMaquinariaService.obtenerTodasLasCompras()
export const obtenerCompraPorId = (id: number) => compraMaquinariaService.obtenerCompraPorId(id)
export const actualizarCompra = (id: number, data: Partial<CreateCompraMaquinaria>, file?: File) =>
  compraMaquinariaService.actualizarCompra(id, data, file)
export const eliminarPadron = (id: number) => compraMaquinariaService.eliminarPadron(id)
export const descargarPadron = (id: number) => compraMaquinariaService.descargarPadron(id)
export const eliminarCompra = (id: number) => compraMaquinariaService.eliminarCompra(id)
export const restaurarCompra = (id: number) => compraMaquinariaService.restaurarCompra(id)
