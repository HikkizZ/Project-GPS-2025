import multer from "multer"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import type { Express } from "express"
import { ALLOWED_FILE_TYPES, FILE_LIMITS } from "../config/remoteServer.config.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Directorio temporal para archivos antes de subirlos al servidor remoto
const TEMP_DIR = path.resolve(__dirname, "..", "..", "temp", "uploads")

// Crear directorio temporal si no existe
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true })
}

export interface FileUploadMiddlewareOptions {
  allowedTypes?: ("image" | "pdf" | "document")[]
  maxSize?: number
  maxFiles?: number
}

/**
 * Crea un middleware de multer personalizado según las opciones
 */
export function createFileUploadMiddleware(options: FileUploadMiddlewareOptions = {}) {
  const { allowedTypes = ["image", "pdf"], maxSize = FILE_LIMITS.maxSize, maxFiles = FILE_LIMITS.maxFiles } = options

  // Configuración de almacenamiento temporal
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, TEMP_DIR)
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")
      cb(null, `temp_${uniqueSuffix}_${sanitizedName}`)
    },
  })

  // Filtro para validar tipos de archivo
  const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes: string[] = []
    const allowedExtensions: string[] = []

    allowedTypes.forEach((type) => {
      switch (type) {
        case "image":
          allowedMimes.push(...ALLOWED_FILE_TYPES.images)
          allowedExtensions.push(...ALLOWED_FILE_TYPES.extensions.images)
          break
        case "pdf":
          allowedMimes.push(...ALLOWED_FILE_TYPES.pdf)
          allowedExtensions.push(...ALLOWED_FILE_TYPES.extensions.pdf)
          break
        case "document":
          allowedMimes.push(...ALLOWED_FILE_TYPES.documents)
          allowedExtensions.push(...ALLOWED_FILE_TYPES.extensions.documents)
          break
      }
    })

    const fileExtension = path.extname(file.originalname).toLowerCase()

    if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
      cb(null, true)
    } else {
      cb(new Error(`Tipo de archivo no permitido. Solo se permiten: ${allowedTypes.join(", ")}`))
    }
  }

  // Configuración de Multer
  return multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: maxSize,
      files: maxFiles,
    },
  })
}

// Middlewares predefinidos para casos comunes
export const imageUploadMiddleware = createFileUploadMiddleware({
  allowedTypes: ["image"],
  maxSize: 10 * 1024 * 1024, // 10MB para imágenes
})

export const pdfUploadMiddleware = createFileUploadMiddleware({
  allowedTypes: ["pdf"],
  maxSize: 25 * 1024 * 1024, // 25MB para PDFs
})

export const generalUploadMiddleware = createFileUploadMiddleware({
  allowedTypes: ["image", "pdf"],
  maxSize: 25 * 1024 * 1024, // 25MB general
})

export const documentUploadMiddleware = createFileUploadMiddleware({
  allowedTypes: ["document"],
  maxSize: 25 * 1024 * 1024, // 25MB para documentos
})

// Middleware para manejo de errores de multer
export const handleMulterError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "El archivo excede el tamaño máximo permitido",
        error: "FILE_TOO_LARGE",
      })
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Demasiados archivos",
        error: "TOO_MANY_FILES",
      })
    }
  }

  if (error.message.includes("Tipo de archivo no permitido")) {
    return res.status(400).json({
      success: false,
      message: error.message,
      error: "INVALID_FILE_TYPE",
    })
  }

  return res.status(500).json({
    success: false,
    message: "Error al procesar el archivo",
    error: error.message,
  })
}

// Función para limpiar archivos temporales antiguos
export const cleanupTempFiles = () => {
  try {
    const files = fs.readdirSync(TEMP_DIR)
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 horas

    files.forEach((file) => {
      const filePath = path.join(TEMP_DIR, file)
      const stats = fs.statSync(filePath)

      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath)
        console.log(`Archivo temporal eliminado: ${file}`)
      }
    })
  } catch (error) {
    console.error("Error al limpiar archivos temporales:", error)
  }
}

// Ejecutar limpieza cada hora
setInterval(cleanupTempFiles, 60 * 60 * 1000)
