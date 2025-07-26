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
   * Elimina un archivo de contrato específico
   */
  static deleteContratoFile(filename: string): boolean {
    const filePath = FileUploadService.getContratoPath(filename)
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
    }
  }

  /**
   * Inicializa los directorios necesarios
   */
  static initialize(): void {
    FileUploadService.ensureUploadDirectories()
  }
}


/**
 * Servicio específico para maquinaria (agregado para compatibilidad)
 */
export class MaquinariaFileUploadService {
  private static readonly UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(BACKEND_ROOT, "uploads")
  private static readonly PADRON_DIR = path.join(MaquinariaFileUploadService.UPLOADS_DIR, "padrones")

  /**
   * Inicializa los directorios necesarios
   */
  static initialize(): void {
    if (!fs.existsSync(MaquinariaFileUploadService.UPLOADS_DIR)) {
      fs.mkdirSync(MaquinariaFileUploadService.UPLOADS_DIR, { recursive: true })
    }
    if (!fs.existsSync(MaquinariaFileUploadService.PADRON_DIR)) {
      fs.mkdirSync(MaquinariaFileUploadService.PADRON_DIR, { recursive: true })
    }
  }

  /**
   * Función helper para determinar el tipo de archivo
   */
  static getFileType(mimetype: string): "image" | "pdf" {
    if (mimetype.startsWith("image/")) {
      return "image"
    } else if (mimetype === "application/pdf") {
      return "pdf"
    }
    throw new Error("Tipo de archivo no soportado")
  }

  /**
   * Función helper para generar nombre de archivo seguro
   */
  static generateSafeFilename(originalName: string, folder = "padron"): string {
    const timestamp = Date.now()
    const randomSuffix = Math.round(Math.random() * 1e6)
    const extension = path.extname(originalName).toLowerCase()
    const baseName = path
      .basename(originalName, extension)
      .replace(/[^a-zA-Z0-9]/g, "_")
      .substring(0, 20)

    return `${folder}_${baseName}_${timestamp}_${randomSuffix}${extension}`
  }

  /**
   * Sube un archivo desde el directorio temporal al directorio final
   */
  static async uploadFile(file: Express.Multer.File): Promise<FileUploadResult> {
    try {
      // Inicializar directorios
      MaquinariaFileUploadService.initialize()

      // Generar nombre seguro para el archivo
      const safeFilename = MaquinariaFileUploadService.generateSafeFilename(file.originalname, "padron")
      const finalPath = path.join(MaquinariaFileUploadService.PADRON_DIR, safeFilename)

      // Mover archivo del directorio temporal al final
      await fs.promises.copyFile(file.path, finalPath)

      // Eliminar archivo temporal
      try {
        await fs.promises.unlink(file.path)
      } catch (error) {
        console.warn("No se pudo eliminar archivo temporal:", error)
      }

      // Generar URL relativa
      const relativeUrl = path.join("uploads", "padrones", safeFilename).replace(/\\/g, "/")

      return {
        url: `/${relativeUrl}`,
        filename: safeFilename,
        fileType: MaquinariaFileUploadService.getFileType(file.mimetype),
        originalName: file.originalname,
        size: file.size,
      }
    } catch (error) {
      console.error("Error al subir archivo:", error)
      throw new Error("Error al procesar el archivo")
    }
  }

  /**
   * Elimina un archivo del servidor
   */
  static async deleteFile(filename: string): Promise<boolean> {
    try {
      const filePath = path.join(MaquinariaFileUploadService.PADRON_DIR, filename)

      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath)
        return true
      }

      return false
    } catch (error) {
      console.error("Error al eliminar archivo:", error)
      return false
    }
  }

  /**
   * Verifica si un archivo existe
   */
  static fileExists(filename: string): boolean {
    try {
      const filePath = path.join(MaquinariaFileUploadService.PADRON_DIR, filename)
      return fs.existsSync(filePath)
    } catch (error) {
      console.error("Error al verificar archivo:", error)
      return false
    }
  }

  /**
   * Obtiene la ruta completa de un archivo
   */
  static getFilePath(filename: string): string {
    return path.join(MaquinariaFileUploadService.PADRON_DIR, filename)
  }

  /**
   * Obtiene información de un archivo
   */
  static async getFileInfo(filename: string): Promise<{ size: number; exists: boolean } | null> {
    try {
      const filePath = path.join(MaquinariaFileUploadService.PADRON_DIR, filename)

      if (!fs.existsSync(filePath)) {
        return { size: 0, exists: false }
      }

      const stats = await fs.promises.stat(filePath)
      return {
        size: stats.size,
        exists: true,
      }
    } catch (error) {
      console.error("Error al obtener información del archivo:", error)
      return null
    }
  }
}

// Exportar instancia por defecto para compatibilidad
export const fileUploadService = new FileUploadService()

// Export por defecto para compatibilidad con código existente
export default FileUploadService
