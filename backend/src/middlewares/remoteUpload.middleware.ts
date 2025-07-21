import multer from "multer"
import path from "path"
import fs from "fs"
import type { Express } from "express"
import type { Request, Response, NextFunction } from "express"
import { RemoteFileUploadService } from "../services/updateFileServer.service.js"

// Crear directorio temporal si no existe
const tempDir = path.join(process.cwd(), "temp")
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true })
}

// Configuración de almacenamiento temporal (los archivos se suben primero aquí)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir)
  },
  filename: (req, file, cb) => {
    // Generar nombre único temporal
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const extension = path.extname(file.originalname)
    cb(null, `temp-${uniqueSuffix}${extension}`)
  },
})

// Filtro para validar tipos de archivo
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    // Imágenes
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    // PDF
    "application/pdf",
  ]

  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf"]
  const fileExtension = path.extname(file.originalname).toLowerCase()

  if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true)
  } else {
    cb(new Error("Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP) y archivos PDF"))
  }
}

// Configuración de multer
export const remoteUploadMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB máximo
    files: 1, // Solo un archivo por vez
  },
})

// Middleware específico para diferentes tipos de archivos
export const uploadPadron = remoteUploadMiddleware.single("padron")
export const uploadContrato = remoteUploadMiddleware.single("contrato")
export const uploadLicencia = remoteUploadMiddleware.single("licencia")
export const uploadCertificado = remoteUploadMiddleware.single("certificado")
export const uploadGeneral = remoteUploadMiddleware.single("archivo")

/**
 * Middleware personalizado que sube el archivo al servidor remoto después de multer
 */
export const processRemoteUpload = (folderType: keyof typeof RemoteFileUploadService.FOLDERS) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next()
    }

    try {
      console.log(`📤 Procesando subida remota para: ${req.file.originalname}`)

      // Subir archivo al servidor remoto
      const uploadResult = await RemoteFileUploadService.uploadFile(
        req.file.path, // Ruta del archivo temporal
        RemoteFileUploadService.FOLDERS[folderType],
        req.file.originalname,
        req.file.mimetype,
      )

      // Limpiar archivo temporal
      try {
        fs.unlinkSync(req.file.path)
        console.log(`🗑️ Archivo temporal eliminado: ${req.file.path}`)
      } catch (cleanupError) {
        console.warn("⚠️ No se pudo eliminar archivo temporal:", cleanupError)
      }

      // Agregar información del archivo remoto al request
      req.remoteFile = uploadResult

      console.log(`✅ Archivo subido exitosamente: ${uploadResult.url}`)
      next()
    } catch (error) {
      console.error("❌ Error en processRemoteUpload:", error)

      // Limpiar archivo temporal en caso de error
      try {
        if (req.file?.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path)
        }
      } catch (cleanupError) {
        console.warn("⚠️ No se pudo limpiar archivo temporal tras error:", cleanupError)
      }

      res.status(500).json({
        success: false,
        message: "Error al subir archivo al servidor remoto",
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }
}

// Middlewares combinados para diferentes tipos
export const uploadAndProcessPadron = [uploadPadron, processRemoteUpload("PADRONES")]
export const uploadAndProcessContrato = [uploadContrato, processRemoteUpload("CONTRATOS")]
export const uploadAndProcessLicencia = [uploadLicencia, processRemoteUpload("LICENCIAS")]
export const uploadAndProcessCertificado = [uploadGeneral, processRemoteUpload("CERTIFICADOS")]
export const uploadAndProcessGeneral = [uploadGeneral, processRemoteUpload("GENERAL")]

/**
 * Función para limpiar archivos temporales antiguos
 */
export const cleanupTempFiles = () => {
  try {
    const files = fs.readdirSync(tempDir)
    const now = Date.now()
    const maxAge = 2 * 60 * 60 * 1000 // 2 horas

    files.forEach((file) => {
      const filePath = path.join(tempDir, file)
      const stats = fs.statSync(filePath)

      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath)
        console.log(`🗑️ Archivo temporal antiguo eliminado: ${file}`)
      }
    })
  } catch (error) {
    console.error("❌ Error al limpiar archivos temporales:", error)
  }
}

// Limpiar archivos temporales cada hora
setInterval(cleanupTempFiles, 60 * 60 * 1000)

export default {
  remoteUploadMiddleware,
  uploadPadron,
  uploadContrato,
  uploadLicencia,
  uploadCertificado,
  uploadGeneral,
  processRemoteUpload,
  uploadAndProcessPadron,
  uploadAndProcessContrato,
  uploadAndProcessLicencia,
  uploadAndProcessCertificado,
  uploadAndProcessGeneral,
  cleanupTempFiles,
}
