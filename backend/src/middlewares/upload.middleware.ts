import multer from "multer"
import path from "path"
import fs from "fs"
import type { Express } from "express"

// Crear directorio temporal si no existe
const tempDir = path.join(process.cwd(), "temp")
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true })
}

// Configuración de almacenamiento temporal
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

// Filtro para validar tipos de archivo (imágenes y PDF)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Tipos de archivo permitidos: imágenes y PDF
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
export const uploadMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB máximo
    files: 1, // Solo un archivo por vez
  },
})

// Middleware específico para padrón (acepta imágenes y PDF)
export const uploadPadron = uploadMiddleware.single("padron")

// Función helper para determinar el tipo de archivo
export const getFileType = (mimetype: string): "image" | "pdf" => {
  if (mimetype.startsWith("image/")) {
    return "image"
  } else if (mimetype === "application/pdf") {
    return "pdf"
  }
  throw new Error("Tipo de archivo no soportado")
}

// Función helper para validar extensión
export const getFileExtension = (filename: string): string => {
  return path.extname(filename).toLowerCase()
}

// Función helper para generar nombre de archivo seguro
export const generateSafeFilename = (originalName: string, folder = "compras"): string => {
  const timestamp = Date.now()
  const randomSuffix = Math.round(Math.random() * 1e6)
  const extension = path.extname(originalName).toLowerCase()
  const baseName = path
    .basename(originalName, extension)
    .replace(/[^a-zA-Z0-9]/g, "_") // Reemplazar caracteres especiales
    .substring(0, 20) // Limitar longitud

  return `${folder}_${baseName}_${timestamp}_${randomSuffix}${extension}`
}

// Función para limpiar archivos temporales antiguos (opcional)
export const cleanupTempFiles = () => {
  try {
    const files = fs.readdirSync(tempDir)
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 horas

    files.forEach((file) => {
      const filePath = path.join(tempDir, file)
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
