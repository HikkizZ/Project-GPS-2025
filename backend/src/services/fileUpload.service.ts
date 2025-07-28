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
      } else if (req.baseUrl.includes("compra-maquinaria")) {
        uploadDir = path.join(uploadDir, "maquinaria", "images")
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
   * Filtro para PDFs y imágenes
   */
  private static fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (req.baseUrl.includes("compra-maquinaria")) {
      // Solo imágenes para maquinaria
      const isValidImage = file.mimetype.startsWith("image/")
      if (!isValidImage) {
        cb(new Error("Solo se permiten archivos de imagen"))
        return
      }
    } else {
      // Solo PDFs para otros módulos
      const isValidMime = file.mimetype === "application/pdf"
      const isValidExt = path.extname(file.originalname).toLowerCase() === ".pdf"
      if (!isValidMime || !isValidExt) {
        cb(new Error("Solo se permiten archivos PDF"))
        return
      }
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
      fileSize: 25 * 1024 * 1024,
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
        fileSize: 25 * 1024 * 1024,
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

  static getMaquinariaPath(filenameOrPath: string): string {
    const baseFilename = path.basename(filenameOrPath)
    return path.join(FileUploadService.UPLOADS_DIR, "maquinaria", "images", baseFilename)
  }

  /**
   * Elimina un archivo de contrato específico
   */
  static deleteContratoFile(filename: string): boolean {
    const filePath = FileUploadService.getContratoPath(filename)
    return FileUploadService.deleteFile(filePath)
  }

  static deleteMaquinariaFile(filename: string): boolean {
    const filePath = FileUploadService.getMaquinariaPath(filename)
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
      path.join(FileUploadService.UPLOADS_DIR, "general"),
      path.join(FileUploadService.UPLOADS_DIR, "maquinaria"),
      path.join(FileUploadService.UPLOADS_DIR, "maquinaria", "images"),
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
      GENERAL_DIR: path.join(FileUploadService.UPLOADS_DIR, "general"),
      MAQUINARIA_DIR: path.join(FileUploadService.UPLOADS_DIR, "maquinaria"),
      MAQUINARIA_IMAGES_DIR: path.join(FileUploadService.UPLOADS_DIR, "maquinaria", "images"),
    }
  }

  /**
   * Inicializa los directorios necesarios
   */
  static initialize(): void {
    FileUploadService.ensureUploadDirectories()
  }
}

export class MaquinariaFileUploadService {
  static async uploadFile(file: Express.Multer.File): Promise<FileUploadResult> {
    try {
      const relativeUrl = file.path.replace(process.cwd(), "").replace(/\\/g, "/").substring(1)

      return {
        url: `/${relativeUrl}`,
        filename: file.filename,
        fileType: file.mimetype.startsWith("image/") ? "image" : "pdf",
        originalName: file.originalname,
        size: file.size,
      }
    } catch (error) {
      console.error("Error al procesar archivo:", error)
      throw new Error("Error al procesar el archivo")
    }
  }

  static async deleteFile(filename: string): Promise<boolean> {
    return FileUploadService.deleteMaquinariaFile(filename)
  }

  static fileExists(filename: string): boolean {
    const filePath = FileUploadService.getMaquinariaPath(filename)
    return FileUploadService.fileExists(filePath)
  }
}

// Exportar instancia por defecto para compatibilidad
export const fileUploadService = new FileUploadService()

// Export por defecto para compatibilidad con código existente
export default FileUploadService
