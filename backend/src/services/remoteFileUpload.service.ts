import { Client } from "ssh2"
import fs from "fs"
import path from "path"
import {
  REMOTE_SERVER_CONFIG,
  ALLOWED_FILE_TYPES,
  FILE_LIMITS,
  MODULE_FOLDERS,
  type ModuleFolder,
} from "../config/remoteServer.config.js"
import type { Express } from "express"

export interface RemoteFileUploadResult {
  url: string
  filename: string
  fileType: "image" | "pdf" | "document"
  originalName: string
  size: number
  remotePath: string
  module: string
}

export interface UploadOptions {
  module: ModuleFolder
  allowedTypes?: ("image" | "pdf" | "document")[]
  maxSize?: number
  customFolder?: string
}

export class RemoteFileUploadService {
  private static instance: RemoteFileUploadService
  private sshClient: Client | null = null

  private constructor() {}

  public static getInstance(): RemoteFileUploadService {
    if (!RemoteFileUploadService.instance) {
      RemoteFileUploadService.instance = new RemoteFileUploadService()
    }
    return RemoteFileUploadService.instance
  }

  /**
   * Establece conexión SSH con el servidor remoto
   */
  private async connectSSH(): Promise<Client> {
    return new Promise((resolve, reject) => {
      const conn = new Client()

      conn
        .on("ready", () => {
          console.log("Conexión SSH establecida con el servidor remoto")
          resolve(conn)
        })
        .on("error", (err) => {
          console.error("Error de conexión SSH:", err)
          reject(err)
        })
        .connect({
          host: REMOTE_SERVER_CONFIG.host,
          port: REMOTE_SERVER_CONFIG.port,
          username: REMOTE_SERVER_CONFIG.username,
          password: REMOTE_SERVER_CONFIG.password,
          readyTimeout: REMOTE_SERVER_CONFIG.timeout,
        })
    })
  }

  /**
   * Cierra la conexión SSH
   */
  private closeSSH(): void {
    if (this.sshClient) {
      this.sshClient.end()
      this.sshClient = null
    }
  }

  /**
   * Determina el tipo de archivo basado en el mimetype
   */
  private getFileType(mimetype: string): "image" | "pdf" | "document" {
    if (ALLOWED_FILE_TYPES.images.includes(mimetype)) {
      return "image"
    } else if (mimetype === "application/pdf") {
      return "pdf"
    } else if (ALLOWED_FILE_TYPES.documents.includes(mimetype)) {
      return "document"
    }
    throw new Error("Tipo de archivo no soportado")
  }

  /**
   * Genera un nombre de archivo seguro y único
   */
  private generateSafeFilename(originalName: string, module: string, customPrefix?: string): string {
    const timestamp = Date.now()
    const randomSuffix = Math.round(Math.random() * 1e6)
    const extension = path.extname(originalName).toLowerCase()
    const baseName = path
      .basename(originalName, extension)
      .replace(/[^a-zA-Z0-9]/g, "_")
      .substring(0, 20)

    const prefix = customPrefix || module
    return `${prefix}_${baseName}_${timestamp}_${randomSuffix}${extension}`
  }

  /**
   * Valida el archivo antes de subirlo
   */
  private validateFile(file: Express.Multer.File, options: UploadOptions): void {
    const maxSize = options.maxSize || FILE_LIMITS.maxSize

    // Validar tamaño
    if (file.size > maxSize) {
      throw new Error(`El archivo excede el tamaño máximo permitido (${maxSize / (1024 * 1024)}MB)`)
    }

    // Determinar tipos permitidos
    const allowedTypes = options.allowedTypes || ["image", "pdf"]
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

    // Validar tipo MIME
    if (!allowedMimes.includes(file.mimetype)) {
      throw new Error(`Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(", ")}`)
    }

    // Validar extensión
    const extension = path.extname(file.originalname).toLowerCase()
    if (!allowedExtensions.includes(extension)) {
      throw new Error("Extensión de archivo no permitida")
    }
  }

  /**
   * Crea el directorio remoto si no existe
   */
  private async ensureRemoteDirectory(remotePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.sshClient) {
        reject(new Error("No hay conexión SSH activa"))
        return
      }

      this.sshClient.exec(`mkdir -p "${remotePath}"`, (err, stream) => {
        if (err) {
          reject(err)
          return
        }

        stream
          .on("close", (code: number) => {
            if (code === 0) {
              resolve()
            } else {
              reject(new Error(`Error al crear directorio remoto. Código: ${code}`))
            }
          })
          .on("data", (data: Buffer) => {
            console.log("STDOUT:", data.toString())
          })
          .stderr.on("data", (data: Buffer) => {
            console.error("STDERR:", data.toString())
          })
      })
    })
  }

  /**
   * Transfiere el archivo al servidor remoto usando SFTP
   */
  private async transferFile(localPath: string, remotePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.sshClient) {
        reject(new Error("No hay conexión SSH activa"))
        return
      }

      this.sshClient.sftp((err, sftp) => {
        if (err) {
          reject(err)
          return
        }

        const readStream = fs.createReadStream(localPath)
        const writeStream = sftp.createWriteStream(remotePath)

        writeStream.on("close", () => {
          console.log(`Archivo transferido exitosamente a: ${remotePath}`)
          resolve()
        })

        writeStream.on("error", (error: Error) => {
          console.error("Error al escribir archivo remoto:", error)
          reject(error)
        })

        readStream.on("error", (error) => {
          console.error("Error al leer archivo local:", error)
          reject(error)
        })

        readStream.pipe(writeStream)
      })
    })
  }

  /**
   * Sube un archivo al servidor remoto
   */
  public async uploadFile(file: Express.Multer.File, options: UploadOptions): Promise<RemoteFileUploadResult> {
    let retries = 0
    const maxRetries = REMOTE_SERVER_CONFIG.maxRetries

    while (retries < maxRetries) {
      try {
        // Validar archivo
        this.validateFile(file, options)

        // Establecer conexión SSH
        this.sshClient = await this.connectSSH()

        // Generar nombre seguro para el archivo
        const moduleFolder = MODULE_FOLDERS[options.module]
        const customFolder = options.customFolder || moduleFolder
        const safeFilename = this.generateSafeFilename(file.originalname, customFolder)
        const fileType = this.getFileType(file.mimetype)

        // Determinar carpeta según tipo de archivo
        let typeFolder: string
        switch (fileType) {
          case "image":
            typeFolder = "images"
            break
          case "pdf":
            typeFolder = "pdfs"
            break
          case "document":
            typeFolder = "documents"
            break
          default:
            typeFolder = "general"
        }

        const remoteDir = path.posix.join(REMOTE_SERVER_CONFIG.uploadPath, customFolder, typeFolder)
        const remotePath = path.posix.join(remoteDir, safeFilename)

        // Crear directorio remoto si no existe
        await this.ensureRemoteDirectory(remoteDir)

        // Transferir archivo
        await this.transferFile(file.path, remotePath)

        // Limpiar archivo temporal local
        try {
          await fs.promises.unlink(file.path)
        } catch (error) {
          console.warn("No se pudo eliminar archivo temporal:", error)
        }

        // Cerrar conexión SSH
        this.closeSSH()

        // Generar URL pública
        const publicUrl = `${REMOTE_SERVER_CONFIG.baseUrl}/${customFolder}/${typeFolder}/${safeFilename}`

        return {
          url: publicUrl,
          filename: safeFilename,
          fileType,
          originalName: file.originalname,
          size: file.size,
          remotePath,
          module: options.module,
        }
      } catch (error) {
        retries++
        console.error(`Intento ${retries} fallido:`, error)

        // Cerrar conexión en caso de error
        this.closeSSH()

        // Limpiar archivo temporal en caso de error
        try {
          if (fs.existsSync(file.path)) {
            await fs.promises.unlink(file.path)
          }
        } catch (cleanupError) {
          console.warn("Error al limpiar archivo temporal:", cleanupError)
        }

        if (retries >= maxRetries) {
          throw new Error(`Error al subir archivo después de ${maxRetries} intentos: ${error}`)
        }

        // Esperar antes del siguiente intento
        await new Promise((resolve) => setTimeout(resolve, 1000 * retries))
      }
    }

    throw new Error("Error inesperado en la subida de archivo")
  }

  /**
   * Elimina un archivo del servidor remoto
   */
  public async deleteFile(filename: string, options: UploadOptions): Promise<boolean> {
    let retries = 0
    const maxRetries = REMOTE_SERVER_CONFIG.maxRetries

    while (retries < maxRetries) {
      try {
        // Establecer conexión SSH
        this.sshClient = await this.connectSSH()

        const moduleFolder = MODULE_FOLDERS[options.module]
        const customFolder = options.customFolder || moduleFolder

        // Determinar rutas posibles según tipos permitidos
        const allowedTypes = options.allowedTypes || ["image", "pdf"]
        const deletePaths: string[] = []

        allowedTypes.forEach((type) => {
          let typeFolder: string
          switch (type) {
            case "image":
              typeFolder = "images"
              break
            case "pdf":
              typeFolder = "pdfs"
              break
            case "document":
              typeFolder = "documents"
              break
            default:
              typeFolder = "general"
          }
          deletePaths.push(path.posix.join(REMOTE_SERVER_CONFIG.uploadPath, customFolder, typeFolder, filename))
        })

        // Intentar eliminar de todas las ubicaciones posibles
        const deletePromises = deletePaths.map((filePath) => this.deleteRemoteFile(filePath))
        const results = await Promise.allSettled(deletePromises)
        const success = results.some((result) => result.status === "fulfilled" && result.value === true)

        // Cerrar conexión SSH
        this.closeSSH()

        return success
      } catch (error) {
        retries++
        console.error(`Intento ${retries} de eliminación fallido:`, error)

        // Cerrar conexión en caso de error
        this.closeSSH()

        if (retries >= maxRetries) {
          console.error(`Error al eliminar archivo después de ${maxRetries} intentos:`, error)
          return false
        }

        // Esperar antes del siguiente intento
        await new Promise((resolve) => setTimeout(resolve, 1000 * retries))
      }
    }

    return false
  }

  /**
   * Elimina un archivo específico del servidor remoto
   */
  private async deleteRemoteFile(remotePath: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.sshClient) {
        reject(new Error("No hay conexión SSH activa"))
        return
      }

      this.sshClient.sftp((err, sftp) => {
        if (err) {
          reject(err)
          return
        }

        sftp.unlink(remotePath, (unlinkErr) => {
          if (unlinkErr) {
            // Si el archivo no existe, no es un error crítico
            if (unlinkErr.message.includes("No such file")) {
              resolve(false)
            } else {
              reject(unlinkErr)
            }
          } else {
            console.log(`Archivo eliminado exitosamente: ${remotePath}`)
            resolve(true)
          }
        })
      })
    })
  }

  /**
   * Verifica si un archivo existe en el servidor remoto
   */
  public async fileExists(filename: string, options: UploadOptions): Promise<boolean> {
    try {
      // Establecer conexión SSH
      this.sshClient = await this.connectSSH()

      const moduleFolder = MODULE_FOLDERS[options.module]
      const customFolder = options.customFolder || moduleFolder
      const allowedTypes = options.allowedTypes || ["image", "pdf"]

      // Verificar en todas las ubicaciones posibles
      const checkPromises = allowedTypes.map((type) => {
        let typeFolder: string
        switch (type) {
          case "image":
            typeFolder = "images"
            break
          case "pdf":
            typeFolder = "pdfs"
            break
          case "document":
            typeFolder = "documents"
            break
          default:
            typeFolder = "general"
        }
        const filePath = path.posix.join(REMOTE_SERVER_CONFIG.uploadPath, customFolder, typeFolder, filename)
        return this.checkRemoteFileExists(filePath)
      })

      const results = await Promise.allSettled(checkPromises)
      const exists = results.some((result) => result.status === "fulfilled" && result.value === true)

      // Cerrar conexión SSH
      this.closeSSH()

      return exists
    } catch (error) {
      console.error("Error al verificar existencia de archivo:", error)
      this.closeSSH()
      return false
    }
  }

  /**
   * Verifica si un archivo específico existe en el servidor remoto
   */
  private async checkRemoteFileExists(remotePath: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.sshClient) {
        resolve(false)
        return
      }

      this.sshClient.sftp((err, sftp) => {
        if (err) {
          resolve(false)
          return
        }

        sftp.stat(remotePath, (statErr) => {
          resolve(!statErr)
        })
      })
    })
  }

  /**
   * Obtiene la URL pública de un archivo
   */
  public getPublicUrl(
    filename: string,
    options: UploadOptions,
    fileType: "image" | "pdf" | "document" = "image",
  ): string {
    const moduleFolder = MODULE_FOLDERS[options.module]
    const customFolder = options.customFolder || moduleFolder

    let typeFolder: string
    switch (fileType) {
      case "image":
        typeFolder = "images"
        break
      case "pdf":
        typeFolder = "pdfs"
        break
      case "document":
        typeFolder = "documents"
        break
      default:
        typeFolder = "general"
    }

    return `${REMOTE_SERVER_CONFIG.baseUrl}/${customFolder}/${typeFolder}/${filename}`
  }
}

// Exportar instancia singleton
export const remoteFileUploadService = RemoteFileUploadService.getInstance()
