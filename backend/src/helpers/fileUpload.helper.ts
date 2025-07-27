import { remoteFileUploadService, type UploadOptions } from "../services/remoteFileUpload.service.js"
import { createFileUploadMiddleware, type FileUploadMiddlewareOptions } from "../middlewares/fileUpload.middleware.js"
import type { Express } from "express"
import type { ModuleFolder } from "../config/remoteServer.config.js"

/**
 * Helper para crear servicios de subida de archivos para cualquier módulo al servidor remoto
 */
export class FileUploadHelper {
  static createModuleUploadService(module: ModuleFolder, options: Partial<UploadOptions> = {}) {
    const uploadOptions: UploadOptions = {
      module,
      allowedTypes: ["image", "pdf"],
      maxSize: 25 * 1024 * 1024,
      ...options,
    }

    return {
      async uploadFile(file: Express.Multer.File) {
        try {
          const result = await remoteFileUploadService.uploadFile(file, uploadOptions)
          return {
            url: result.url,
            filename: result.filename,
            fileType: result.fileType,
            originalName: result.originalName,
            size: result.size,
          }
        } catch (error) {
          console.error(`Error en ${module} uploadFile:`, error)
          throw new Error(`Error al subir archivo de ${module}: ${error}`)
        }
      },

      async deleteFile(filename: string): Promise<boolean> {
        try {
          return await remoteFileUploadService.deleteFile(filename, uploadOptions)
        } catch (error) {
          console.error(`Error en ${module} deleteFile:`, error)
          return false
        }
      },

      async fileExists(filename: string): Promise<boolean> {
        try {
          return await remoteFileUploadService.fileExists(filename, uploadOptions)
        } catch (error) {
          console.error(`Error en ${module} fileExists:`, error)
          return false
        }
      },

      getPublicUrl(filename: string, fileType: "image" | "pdf" | "document" = "image"): string {
        return remoteFileUploadService.getPublicUrl(filename, uploadOptions, fileType)
      },
    }
  }

  static createModuleMiddleware(options: FileUploadMiddlewareOptions = {}) {
    return createFileUploadMiddleware(options)
  }
}

// Servicios para otros módulos
export const empleadosUploadService = FileUploadHelper.createModuleUploadService("empleados", {
  allowedTypes: ["image", "pdf"],
  customFolder: "empleados",
})

export const contratosUploadService = FileUploadHelper.createModuleUploadService("contratos", {
  allowedTypes: ["pdf", "document"],
  customFolder: "contratos",
})

export const licenciasUploadService = FileUploadHelper.createModuleUploadService("licencias", {
  allowedTypes: ["pdf"],
  customFolder: "licencias",
})
