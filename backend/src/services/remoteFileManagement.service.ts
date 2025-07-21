import { RemoteFileUploadService, type RemoteFileUploadResult } from "./updateFileServer.service.js"
import path from "path"

export interface RemoteFileInfo {
  exists: boolean
  filename: string
  url: string
  size?: number
  remotePath: string
}

/**
 * Servicio para gestión de archivos en servidor remoto
 */
export class RemoteFileManagementService {
  /**
   * Obtiene información de un archivo remoto para descarga
   */
  static async getRemoteFileForDownload(
    remoteSubfolder: string,
    filename: string,
  ): Promise<[RemoteFileInfo | null, string | null]> {
    try {
      // Verificar si el archivo existe en el servidor remoto
      const exists = await RemoteFileUploadService.fileExists(remoteSubfolder, filename)

      if (!exists) {
        return [null, "Archivo no encontrado en el servidor remoto"]
      }

      const fileInfo: RemoteFileInfo = {
        exists: true,
        filename: filename,
        url: RemoteFileUploadService.getPublicUrl(remoteSubfolder, filename),
        remotePath: path.posix.join("/var/www/html/uploads", remoteSubfolder, filename),
      }

      return [fileInfo, null]
    } catch (error) {
      console.error("Error al obtener información del archivo remoto:", error)
      return [null, `Error al acceder al archivo: ${error}`]
    }
  }

  /**
   * Elimina un archivo del servidor remoto
   */
  static async deleteRemoteFile(remoteSubfolder: string, filename: string): Promise<[boolean, string | null]> {
    try {
      const deleted = await RemoteFileUploadService.deleteFile(remoteSubfolder, filename)

      if (deleted) {
        return [true, null]
      } else {
        return [false, "No se pudo eliminar el archivo o no existe"]
      }
    } catch (error) {
      console.error("Error al eliminar archivo remoto:", error)
      return [false, `Error al eliminar archivo: ${error}`]
    }
  }

  /**
   * Lista archivos en un directorio remoto
   */
  static async listRemoteFiles(remoteSubfolder: string): Promise<[string[], string | null]> {
    try {
      const files = await RemoteFileUploadService.listFiles(remoteSubfolder)
      return [files, null]
    } catch (error) {
      console.error("Error al listar archivos remotos:", error)
      return [[], `Error al listar archivos: ${error}`]
    }
  }

  /**
   * Verifica si un archivo existe en el servidor remoto
   */
  static async remoteFileExists(remoteSubfolder: string, filename: string): Promise<boolean> {
    try {
      return await RemoteFileUploadService.fileExists(remoteSubfolder, filename)
    } catch (error) {
      console.error("Error al verificar existencia de archivo remoto:", error)
      return false
    }
  }

  /**
   * Obtiene la URL pública de un archivo
   */
  static getRemoteFileUrl(remoteSubfolder: string, filename: string): string {
    return RemoteFileUploadService.getPublicUrl(remoteSubfolder, filename)
  }

  /**
   * Procesa el resultado de subida y retorna información formateada
   */
  static formatUploadResult(uploadResult: RemoteFileUploadResult): any {
    return {
      success: true,
      message: "Archivo subido exitosamente",
      data: {
        url: uploadResult.url,
        filename: uploadResult.filename,
        originalName: uploadResult.originalName,
        fileType: uploadResult.fileType,
        size: uploadResult.size,
        remotePath: uploadResult.remotePath,
      },
    }
  }

  /**
   * Maneja errores de subida de archivos
   */
  static handleUploadError(error: any): any {
    console.error("Error en subida de archivo:", error)

    return {
      success: false,
      message: "Error al subir archivo",
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }

  /**
   * Valida el tipo de archivo permitido
   */
  static validateFileType(mimetype: string, allowedTypes: string[] = []): boolean {
    const defaultAllowed = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "application/pdf"]

    const allowed = allowedTypes.length > 0 ? allowedTypes : defaultAllowed
    return allowed.includes(mimetype)
  }

  /**
   * Valida el tamaño del archivo
   */
  static validateFileSize(size: number, maxSizeMB = 25): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    return size <= maxSizeBytes
  }

  /**
   * Obtiene el tipo de carpeta basado en la ruta de la petición
   */
  static getFolderTypeFromRequest(baseUrl: string): keyof typeof RemoteFileUploadService.FOLDERS {
    if (baseUrl.includes("licencia-permiso")) {
      return "LICENCIAS"
    } else if (baseUrl.includes("ficha-empresa") || baseUrl.includes("contrato")) {
      return "CONTRATOS"
    } else if (baseUrl.includes("historial-laboral")) {
      return "HISTORIAL"
    } else if (baseUrl.includes("maquinaria") || baseUrl.includes("padron")) {
      return "PADRONES"
    } else if (baseUrl.includes("certificado")) {
      return "CERTIFICADOS"
    } else {
      return "GENERAL"
    }
  }
}

export default RemoteFileManagementService
