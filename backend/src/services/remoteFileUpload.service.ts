import { Client } from "ssh2"
import fs from "fs"
import path from "path"
import {
  REMOTE_SERVER_CONFIG,
  LOCAL_SERVER_CONFIG,
  FALLBACK_LOCAL_CONFIG,
  ALLOWED_FILE_TYPES,
  FILE_LIMITS,
  MODULE_FOLDERS,
  isDevelopment,
  isProduction,
  type ModuleFolder,
} from "../config/remoteServer.config.js"
import type { Express } from "express"

export interface RemoteFileUploadResult {
  url: string
  filename: string
  originalName: string
  size: number
  uploadMethod: "remote" | "local" | "fallback"
}

export interface UploadOptions {
  module: ModuleFolder
}

export class RemoteFileUploadService {
  private static instance: RemoteFileUploadService

  private constructor() {
    if (isDevelopment || isProduction) {
      this.ensureLocalUploadDirectory()
    }
  }

  public static getInstance(): RemoteFileUploadService {
    if (!RemoteFileUploadService.instance) {
      RemoteFileUploadService.instance = new RemoteFileUploadService()
    }
    return RemoteFileUploadService.instance
  }

  private ensureLocalUploadDirectory(): void {
    const baseDir = isDevelopment ? LOCAL_SERVER_CONFIG.uploadPath : FALLBACK_LOCAL_CONFIG.uploadPath

    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true })
    }

    Object.values(MODULE_FOLDERS).forEach((moduleFolder) => {
      const moduleDir = path.join(baseDir, moduleFolder, "images")
      if (!fs.existsSync(moduleDir)) {
        fs.mkdirSync(moduleDir, { recursive: true })
      }
    })

    console.log(" Carpetas de upload creadas en:", baseDir)
  }

  private validateImageFile(file: Express.Multer.File): void {
    if (file.size > FILE_LIMITS.maxSize) {
      throw new Error(`El archivo excede el tamaño máximo permitido (${FILE_LIMITS.maxSize / (1024 * 1024)}MB)`)
    }

    if (!ALLOWED_FILE_TYPES.images.includes(file.mimetype)) {
      throw new Error("Solo se permiten imágenes (JPG, PNG, GIF, WebP)")
    }
  }

  private generateSafeFilename(originalName: string, module: string): string {
    const timestamp = Date.now()
    const randomSuffix = Math.round(Math.random() * 1e6)
    const extension = path.extname(originalName).toLowerCase()
    const baseName = path
      .basename(originalName, extension)
      .replace(/[^a-zA-Z0-9]/g, "_")
      .substring(0, 20)

    return `${module}_${baseName}_${timestamp}_${randomSuffix}${extension}`
  }

  private async saveFileLocally(
    file: Express.Multer.File,
    options: UploadOptions,
    isFallback = false,
  ): Promise<RemoteFileUploadResult> {
    const config = isFallback ? FALLBACK_LOCAL_CONFIG : LOCAL_SERVER_CONFIG
    const moduleFolder = MODULE_FOLDERS[options.module]
    const safeFilename = this.generateSafeFilename(file.originalname, moduleFolder)

    const localDir = path.join(config.uploadPath, moduleFolder, "images")
    const localPath = path.join(localDir, safeFilename)

    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true })
    }

    await fs.promises.rename(file.path, localPath)

    const publicUrl = `${config.baseUrl}/${moduleFolder}/images/${safeFilename}`

    console.log(` Archivo guardado ${isFallback ? "(FALLBACK)" : "(LOCAL)"}: ${localPath}`)
    console.log(` URL pública: ${publicUrl}`)

    return {
      url: publicUrl,
      filename: safeFilename,
      originalName: file.originalname,
      size: file.size,
      uploadMethod: isFallback ? "fallback" : "local",
    }
  }

  private async uploadToRemoteServerWithFallback(
    file: Express.Multer.File,
    options: UploadOptions,
  ): Promise<RemoteFileUploadResult> {
    let sshClient: Client | null = null

    try {
      console.log(" Intentando subir al servidor remoto...")

      sshClient = await this.connectSSH()

      const moduleFolder = MODULE_FOLDERS[options.module]
      const safeFilename = this.generateSafeFilename(file.originalname, moduleFolder)

      const remoteDir = path.posix.join(REMOTE_SERVER_CONFIG.uploadPath, moduleFolder, "images")
      const remotePath = path.posix.join(remoteDir, safeFilename)

      await this.ensureRemoteDirectory(sshClient, remoteDir)

      await this.transferFile(sshClient, file.path, remotePath)

      try {
        await fs.promises.unlink(file.path)
      } catch (error) {
        console.warn("No se pudo eliminar archivo temporal:", error)
      }

      const publicUrl = `${REMOTE_SERVER_CONFIG.baseUrl}/${moduleFolder}/images/${safeFilename}`

      console.log(` Archivo subido al servidor remoto: ${publicUrl}`)

      return {
        url: publicUrl,
        filename: safeFilename,
        originalName: file.originalname,
        size: file.size,
        uploadMethod: "remote",
      }
    } catch (error) {
      console.error("❌ Error al subir al servidor remoto:", error)
      console.log(" Activando fallback local...")

      try {
        return await this.saveFileLocally(file, options, true)
      } catch (fallbackError) {
        console.error(" Error en fallback local:", fallbackError)
        throw new Error(`Error en servidor remoto Y fallback local: ${error}`)
      }
    } finally {
      if (sshClient) {
        sshClient.end()
      }
    }
  }

  private async connectSSH(): Promise<Client> {
    return new Promise((resolve, reject) => {
      const conn = new Client()

      conn
        .on("ready", () => {
          console.log(" Conexión SSH establecida con servidor de archivos")
          resolve(conn)
        })
        .on("error", (err) => {
          console.error(" Error de conexión SSH:", err)
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

  private async ensureRemoteDirectory(sshClient: Client, remotePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      sshClient.exec(`mkdir -p "${remotePath}"`, (err, stream) => {
        if (err) {
          reject(err)
          return
        }

        stream.on("close", (code: number) => {
          if (code === 0) {
            resolve()
          } else {
            reject(new Error(`Error al crear directorio remoto. Código: ${code}`))
          }
        })
      })
    })
  }

  private async transferFile(sshClient: Client, localPath: string, remotePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      sshClient.sftp((err, sftp) => {
        if (err) {
          reject(err)
          return
        }

        const readStream = fs.createReadStream(localPath)
        const writeStream = sftp.createWriteStream(remotePath)

        writeStream.on("close", () => {
          console.log(` Archivo transferido exitosamente a: ${remotePath}`)
          resolve()
        })

        writeStream.on("error", (error: Error) => {
          console.error(" Error al escribir archivo remoto:", error)
          reject(error)
        })

        readStream.on("error", (error) => {
          console.error(" Error al leer archivo local:", error)
          reject(error)
        })

        readStream.pipe(writeStream)
      })
    })
  }

  public async uploadFile(file: Express.Multer.File, options: UploadOptions): Promise<RemoteFileUploadResult> {
    try {
      this.validateImageFile(file)

      console.log(` Subiendo archivo en modo: ${isDevelopment ? "DESARROLLO" : "PRODUCCIÓN"}`)

      if (isDevelopment) {
        return await this.saveFileLocally(file, options, false)
      } else {
        return await this.uploadToRemoteServerWithFallback(file, options)
      }
    } catch (error) {
      try {
        if (fs.existsSync(file.path)) {
          await fs.promises.unlink(file.path)
        }
      } catch (cleanupError) {
        console.warn(" Error al limpiar archivo temporal:", cleanupError)
      }

      throw new Error(`Error al subir imagen: ${error}`)
    }
  }

  public async deleteFile(filename: string, options: UploadOptions): Promise<boolean> {
    try {
      const moduleFolder = MODULE_FOLDERS[options.module]

      if (isDevelopment) {
        const localPath = path.join(LOCAL_SERVER_CONFIG.uploadPath, moduleFolder, "images", filename)
        return await this.deleteLocalFile(localPath)
      } else {
        try {
          return await this.deleteRemoteFile(filename, moduleFolder)
        } catch (error) {
          console.warn(" Error al eliminar del servidor remoto, intentando local:", error)
          const fallbackPath = path.join(FALLBACK_LOCAL_CONFIG.uploadPath, moduleFolder, "images", filename)
          return await this.deleteLocalFile(fallbackPath)
        }
      }
    } catch (error) {
      console.error(" Error al eliminar archivo:", error)
      return false
    }
  }

  private async deleteLocalFile(filePath: string): Promise<boolean> {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath)
      console.log(`🗑️ Archivo eliminado localmente: ${filePath}`)
      return true
    }
    return false
  }

  private async deleteRemoteFile(filename: string, moduleFolder: string): Promise<boolean> {
    let sshClient: Client | null = null

    try {
      sshClient = await this.connectSSH()
      const remotePath = path.posix.join(REMOTE_SERVER_CONFIG.uploadPath, moduleFolder, "images", filename)

      return new Promise((resolve) => {
        sshClient!.sftp((err, sftp) => {
          if (err) {
            console.error(" Error SFTP:", err)
            resolve(false)
            return
          }

          sftp.unlink(remotePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error(" Error al eliminar archivo remoto:", unlinkErr)
              resolve(false)
            } else {
              console.log(` Archivo eliminado del servidor remoto: ${remotePath}`)
              resolve(true)
            }
          })
        })
      })
    } finally {
      if (sshClient) {
        sshClient.end()
      }
    }
  }
}

export const remoteFileUploadService = RemoteFileUploadService.getInstance()
