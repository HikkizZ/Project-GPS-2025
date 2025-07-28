import { remoteFileUploadService, type RemoteFileUploadResult } from "../remoteFileUpload.service.js"
import type { Express } from "express"

export interface MaquinariaFileUploadResult {
  url: string
  filename: string
  originalName: string
  size: number
}

export class MaquinariaFileUploadService {
  static async uploadFile(file: Express.Multer.File): Promise<MaquinariaFileUploadResult> {
    try {
      const result: RemoteFileUploadResult = await remoteFileUploadService.uploadFile(file, {
        module: "maquinaria",
      })

      return {
        url: result.url,
        filename: result.filename,
        originalName: result.originalName,
        size: result.size,
      }
    } catch (error) {
      console.error("Error en MaquinariaFileUploadService.uploadFile:", error)
      throw new Error(`Error al subir imagen de maquinaria: ${error}`)
    }
  }

  static async deleteFile(filename: string): Promise<boolean> {
    try {
      return await remoteFileUploadService.deleteFile(filename, { module: "maquinaria" })
    } catch (error) {
      console.error("Error en MaquinariaFileUploadService.deleteFile:", error)
      return false
    }
  }
}
