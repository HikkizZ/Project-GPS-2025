import multer from "multer"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import type { Express } from "express"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Path to the backend root directory
const BACKEND_ROOT = path.resolve(__dirname, "..", "..")

export interface FileUploadResult {
  url: string
  filename: string
  fileType: "image" | "pdf"
  originalName: string
  size: number
}

/**
 * Servicio para configuración de subida de archivos (original)
 */
export class FileUploadService {
  private static readonly UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(BACKEND_ROOT, "uploads")

  /**
   * Configuración de almacenamiento con estructura de carpetas organizada
   */
  private static storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Determinar la carpeta según el tipo de archivo
      let uploadDir = FileUploadService.UPLOADS_DIR

      if (req.baseUrl.includes("licencia-permiso")) {
        uploadDir = path.join(uploadDir, "licencias")
      } else if (req.baseUrl.includes("fichas-empresa")) {
        uploadDir = path.join(uploadDir, "contratos")
      } else if (req.baseUrl.includes("historial-laboral")) {
        uploadDir = path.join(uploadDir, "historial")
      } else if (req.baseUrl.includes("maquinaria") || req.baseUrl.includes("compra-maquinaria")) {
        uploadDir = path.join(uploadDir, "padrones")
      } else {
        uploadDir = path.join(uploadDir, "general")
      }

      // Crear el directorio si no existe
      FileUploadService.ensureUploadDirectories()
      cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")
      cb(null, `${uniqueSuffix}-${sanitizedName}`)
    },
  })

  /**
   * Filtro para solo permitir PDFs
   */
  private static fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Validar tipo MIME y extensión
    const isValidMime = file.mimetype === "application/pdf"
    const isValidExt = path.extname(file.originalname).toLowerCase() === ".pdf"

    if (!isValidMime || !isValidExt) {
      cb(new Error("Solo se permiten archivos PDF"))
      return
    }
    cb(null, true)
  }

  /**
   * Configuración de multer para subida de archivos
   */
  static readonly upload = multer({
    storage: FileUploadService.storage,
    fileFilter: FileUploadService.fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB máximo
      files: 1,
    },
  })

  /**
   * Middleware para subida de archivos con validaciones
   */
  static uploadSingle(fieldName = "archivo") {
    return FileUploadService.upload.single(fieldName)
  }

  /**
   * Middleware para subida de múltiples archivos
   */
  static uploadMultiple(fieldName = "archivos", maxFiles = 5) {
    return multer({
      storage: FileUploadService.storage,
      fileFilter: FileUploadService.fileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB máximo
        files: maxFiles,
      },
    }).array(fieldName, maxFiles)
  }

  /**
   * Verifica si un archivo existe en la ruta especificada
   */
  static fileExists(filePath: string): boolean {
    try {
      return fs.existsSync(filePath)
    } catch (error) {
      console.error("Error al verificar existencia del archivo:", error)
      return false
    }
  }

  /**
   * Obtiene la ruta completa de un archivo de contrato
   */
  static getContratoPath(filenameOrPath: string): string {
    const baseFilename = path.basename(filenameOrPath)
    return path.join(FileUploadService.UPLOADS_DIR, "contratos", baseFilename)
  }

  /**
   * Obtiene la ruta completa de un archivo de licencia/permiso
   */
  static getLicenciaPath(filenameOrPath: string): string {
    let filename = filenameOrPath

    if (filenameOrPath.includes("http://") || filenameOrPath.includes("https://")) {
      filename = filenameOrPath.split("/").pop() || filenameOrPath
    }

    const baseFilename = path.basename(filename)
    return path.join(FileUploadService.UPLOADS_DIR, "licencias", baseFilename)
  }

  /**
   * Obtiene la ruta completa de un archivo de padrón de maquinaria
   */
  static getPadronPath(filenameOrPath: string): string {
    const baseFilename = path.basename(filenameOrPath)
    return path.join(FileUploadService.UPLOADS_DIR, "padrones", baseFilename)
  }

  /**
   * Elimina un archivo de contrato específico
   */
  static deleteContratoFile(filename: string): boolean {
    const filePath = FileUploadService.getContratoPath(filename)
    return FileUploadService.deleteFile(filePath)
  }

  /**
   * Elimina un archivo de padrón específico
   */
  static deletePadronFile(filename: string): boolean {
    const filePath = FileUploadService.getPadronPath(filename)
    return FileUploadService.deleteFile(filePath)
  }

  /**
   * Elimina un archivo usando la ruta completa
   */
  static deleteFile(filePath: string): boolean {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        return true
      }
      return false
    } catch (error) {
      console.error("Error al eliminar archivo:", error)
      return false
    }
  }

  /**
   * Crea los directorios necesarios
   */
  static ensureUploadDirectories(): void {
    const directories = [
      FileUploadService.UPLOADS_DIR,
      path.join(FileUploadService.UPLOADS_DIR, "contratos"),
      path.join(FileUploadService.UPLOADS_DIR, "licencias"),
      path.join(FileUploadService.UPLOADS_DIR, "historial"),
      path.join(FileUploadService.UPLOADS_DIR, "padrones"),
      path.join(FileUploadService.UPLOADS_DIR, "general"),
    ]

    directories.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    })
  }

  /**
   * Obtiene las rutas de los directorios de upload
   */
  static get PATHS() {
    return {
      UPLOADS_DIR: FileUploadService.UPLOADS_DIR,
      CONTRATOS_DIR: path.join(FileUploadService.UPLOADS_DIR, "contratos"),
      LICENCIAS_DIR: path.join(FileUploadService.UPLOADS_DIR, "licencias"),
      HISTORIAL_DIR: path.join(FileUploadService.UPLOADS_DIR, "historial"),
      PADRONES_DIR: path.join(FileUploadService.UPLOADS_DIR, "padrones"),
      GENERAL_DIR: path.join(FileUploadService.UPLOADS_DIR, "general"),
    }
  }

  /**
   * Inicializa los directorios necesarios
   */
  static initialize(): void {
    FileUploadService.ensureUploadDirectories()
  }
}

// Mantener compatibilidad con MaquinariaFileUploadService existente
export class MaquinariaFileUploadService {
  // Redirigir a FileUploadService para mantener compatibilidad
  static async uploadFile(file: Express.Multer.File): Promise<FileUploadResult> {
    // El archivo ya fue procesado por Multer, solo necesitamos retornar la info
    return {
      url: `/${path.join("uploads", "padrones", file.filename).replace(/\\/g, "/")}`,
      filename: file.filename,
      fileType: "pdf",
      originalName: file.originalname,
      size: file.size,
    }
  }

  static async deleteFile(filename: string): Promise<boolean> {
    return FileUploadService.deletePadronFile(filename)
  }

  static fileExists(filename: string): boolean {
    const filePath = FileUploadService.getPadronPath(filename)
    return FileUploadService.fileExists(filePath)
  }

  static getFilePath(filename: string): string {
    return FileUploadService.getPadronPath(filename)
  }
}

// Exportar instancia por defecto para compatibilidad
export const fileUploadService = new FileUploadService()

// Export por defecto para compatibilidad con código existente
export default FileUploadService
