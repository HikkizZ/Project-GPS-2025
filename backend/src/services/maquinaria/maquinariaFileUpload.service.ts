import { remoteFileUploadService, type RemoteFileUploadResult } from "../remoteFileUpload.service.js"
import type { Express } from "express"

export interface MaquinariaFileUploadResult {
  url: string
  filename: string
  fileType: "image" | "pdf" | "document"
  originalName: string
  size: number
}

/**
 * Servicio específico para subida de archivos de maquinaria al servidor remoto
 */
export class MaquinariaFileUploadService {
  private static readonly uploadOptions = {
    module: "maquinaria" as const,
    allowedTypes: ["image", "pdf"] as ("image" | "pdf")[],
    maxSize: 25 * 1024 * 1024, // 25MB
  }

  static async uploadFile(file: Express.Multer.File): Promise<MaquinariaFileUploadResult> {
    try {
      const result: RemoteFileUploadResult = await remoteFileUploadService.uploadFile(
        file,
        MaquinariaFileUploadService.uploadOptions,
      )

      return {
        url: result.url,
        filename: result.filename,
        fileType: result.fileType as "image" | "pdf" | "document",
        originalName: result.originalName,
        size: result.size,
      }
    } catch (error) {
      console.error("Error en MaquinariaFileUploadService.uploadFile:", error)
      throw new Error(`Error al subir archivo de maquinaria: ${error}`)
    }
  }

  static async deleteFile(filename: string): Promise<boolean> {
    try {
      return await remoteFileUploadService.deleteFile(filename, MaquinariaFileUploadService.uploadOptions)
    } catch (error) {
      console.error("Error en MaquinariaFileUploadService.deleteFile:", error)
      return false
    }
  }

  static async fileExists(filename: string): Promise<boolean> {
    try {
      return await remoteFileUploadService.fileExists(filename, MaquinariaFileUploadService.uploadOptions)
    } catch (error) {
      console.error("Error en MaquinariaFileUploadService.fileExists:", error)
      return false
    }
  }

  static getPublicUrl(filename: string, fileType: "image" | "pdf" | "document" = "image"): string {
    return remoteFileUploadService.getPublicUrl(filename, MaquinariaFileUploadService.uploadOptions, fileType)
  }
}
