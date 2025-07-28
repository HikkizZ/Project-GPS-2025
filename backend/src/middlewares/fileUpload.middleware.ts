import multer from "multer"
import fs from "fs"
import path from "path"
import type { Request, Response, NextFunction } from "express"
import { FILE_LIMITS, ALLOWED_FILE_TYPES } from "../config/remoteServer.config.js"
import type { Express } from "express"

// Crear directorio temporal
const tempDir = path.join(process.cwd(), "temp-uploads")
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true })
  console.log(`Directorio temporal creado: ${tempDir}`)
}

// Configuración de almacenamiento temporal
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, `temp_${uniqueSuffix}_${file.originalname}`)
  },
})

// Filtro para validar que solo sean imágenes
function imageFileFilter(req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (!ALLOWED_FILE_TYPES.images.includes(file.mimetype)) {
    const error = new Error("Solo se permiten imágenes (JPG, PNG, GIF, WebP)") as any
    error.code = "INVALID_FILE_TYPE"
    return cb(error)
  }
  cb(null, true)
}

// Configuración de Multer
export const generalUploadMiddleware = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: FILE_LIMITS.maxSize, // 25MB
    files: 1,
  },
})

/**
 * Middleware para manejar errores de Multer
 */
export function handleMulterError(error: any, req: Request, res: Response, next: NextFunction) {
  if (error instanceof multer.MulterError) {
    let message = "Error al procesar el archivo"
    let errorCode = "MULTER_ERROR"

    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        message = `El archivo es demasiado grande. Tamaño máximo: ${FILE_LIMITS.maxSize / (1024 * 1024)}MB`
        errorCode = "FILE_TOO_LARGE"
        break
      case "LIMIT_FILE_COUNT":
        message = "Solo se permite un archivo"
        errorCode = "TOO_MANY_FILES"
        break
      case "LIMIT_UNEXPECTED_FILE":
        message = "Campo de archivo inesperado"
        errorCode = "UNEXPECTED_FIELD"
        break
    }

    return res.status(400).json({
      success: false,
      message,
      error: errorCode,
    })
  }

  if (error.code === "INVALID_FILE_TYPE") {
    return res.status(400).json({
      success: false,
      message: "Solo se permiten imágenes (JPG, PNG, GIF, WebP)",
      error: "INVALID_FILE_TYPE",
    })
  }

  next(error)
}
