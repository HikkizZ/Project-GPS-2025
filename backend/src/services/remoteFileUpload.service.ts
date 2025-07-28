import { Client } from "ssh2"
import fs from "fs"
import path from "path"
import {
  REMOTE_SERVER_CONFIG,
  LOCAL_SERVER_CONFIG,
  ALLOWED_FILE_TYPES,
  FILE_LIMITS,
  MODULE_FOLDERS,
  isDevelopment,
  type ModuleFolder,
} from "../config/remoteServer.config.js"
import type { Express } from "express"

export interface RemoteFileUploadResult {
  url: string
  filename: string
  originalName: string
  size: number
}

export interface UploadOptions {
  module: ModuleFolder
}

export class RemoteFileUploadService {
  private static instance: RemoteFileUploadService

  private constructor() {
    // Crear carpeta de uploads en desarrollo
    if (isDevelopment) {
      this.ensureLocalUploadDirectory()
    }
  }

  public static getInstance(): RemoteFileUploadService {
    if (!RemoteFileUploadService.instance) {
      RemoteFileUploadService.instance = new RemoteFileUploadService()
    }
    return RemoteFileUploadService.instance
  }

  /**
   * Crea las carpetas necesarias para desarrollo local
   */
  private ensureLocalUploadDirectory(): void {
    const baseDir = LOCAL_SERVER_CONFIG.uploadPath

    // Crear carpeta base
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true })
    }

    // Crear carpetas por módulo
    Object.values(MODULE_FOLDERS).forEach((moduleFolder) => {
      const moduleDir = path.join(baseDir, moduleFolder, "images")
      if (!fs.existsSync(moduleDir)) {
        fs.mkdirSync(moduleDir, { recursive: true })
      }
    })

    console.log("📁 Carpetas de desarrollo creadas en:", baseDir)
  }

  /**
   * Valida que el archivo sea una imagen
   */
  private validateImageFile(file: Express.Multer.File): void {
    if (file.size > FILE_LIMITS.maxSize) {
      throw new Error(`El archivo excede el tamaño máximo permitido (${FILE_LIMITS.maxSize / (1024 * 1024)}MB)`)
    }

    if (!ALLOWED_FILE_TYPES.images.includes(file.mimetype)) {
      throw new Error("Solo se permiten imágenes (JPG, PNG, GIF, WebP)")
    }
  }

  /**
   * Genera un nombre de archivo único y seguro
   */
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

  /**
   * DESARROLLO: Mueve el archivo a la carpeta local
   */
  private async moveFileLocally(file: Express.Multer.File, options: UploadOptions): Promise<RemoteFileUploadResult> {
    const moduleFolder = MODULE_FOLDERS[options.module]
    const safeFilename = this.generateSafeFilename(file.originalname, moduleFolder)

    const localDir = path.join(LOCAL_SERVER_CONFIG.uploadPath, moduleFolder, "images")
    const localPath = path.join(localDir, safeFilename)

    // Mover archivo desde temp a carpeta final
    await fs.promises.rename(file.path, localPath)

    const publicUrl = `${LOCAL_SERVER_CONFIG.baseUrl}/${moduleFolder}/images/${safeFilename}`

    console.log(`📁 Archivo guardado localmente: ${localPath}`)
    console.log(`🌐 URL pública: ${publicUrl}`)

    return {
      url: publicUrl,
      filename: safeFilename,
      originalName: file.originalname,
      size: file.size,
    }
  }

  /**
   * PRODUCCIÓN: Sube el archivo al servidor remoto
   */
  private async uploadToRemoteServer(
    file: Express.Multer.File,
    options: UploadOptions,
  ): Promise<RemoteFileUploadResult> {
    let sshClient: Client | null = null

    try {
      // Establecer conexión SSH
      sshClient = await this.connectSSH()

      const moduleFolder = MODULE_FOLDERS[options.module]
      const safeFilename = this.generateSafeFilename(file.originalname, moduleFolder)

      const remoteDir = path.posix.join(REMOTE_SERVER_CONFIG.uploadPath, moduleFolder, "images")
      const remotePath = path.posix.join(remoteDir, safeFilename)

      // Crear directorio remoto si no existe
      await this.ensureRemoteDirectory(sshClient, remoteDir)

      // Transferir archivo
      await this.transferFile(sshClient, file.path, remotePath)

      // Limpiar archivo temporal local
      try {
        await fs.promises.unlink(file.path)
      } catch (error) {
        console.warn("No se pudo eliminar archivo temporal:", error)
      }

      const publicUrl = `${REMOTE_SERVER_CONFIG.baseUrl}/${moduleFolder}/images/${safeFilename}`

      console.log(`🚀 Archivo subido al servidor remoto: ${publicUrl}`)

      return {
        url: publicUrl,
        filename: safeFilename,
        originalName: file.originalname,
        size: file.size,
      }
    } finally {
      if (sshClient) {
        sshClient.end()
      }
    }
  }

  /**
   * Establece conexión SSH con el servidor de archivos (solo producción)
   */
  private async connectSSH(): Promise<Client> {
    return new Promise((resolve, reject) => {
      const conn = new Client()

      conn
        .on("ready", () => {
          console.log("🔗 Conexión SSH establecida con servidor de archivos")
          resolve(conn)
        })
        .on("error", (err) => {
          console.error("❌ Error de conexión SSH:", err)
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
   * Crea el directorio remoto si no existe (solo producción)
   */
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

  /**
   * Transfiere el archivo al servidor remoto usando SFTP (solo producción)
   */
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
          console.log(`📤 Archivo transferido exitosamente a: ${remotePath}`)
          resolve()
        })

        writeStream.on("error", (error: Error) => {
          console.error("❌ Error al escribir archivo remoto:", error)
          reject(error)
        })

        readStream.on("error", (error) => {
          console.error("❌ Error al leer archivo local:", error)
          reject(error)
        })

        readStream.pipe(writeStream)
      })
    })
  }

  /**
   * Sube una imagen (funciona en desarrollo y producción)
   */
  public async uploadFile(file: Express.Multer.File, options: UploadOptions): Promise<RemoteFileUploadResult> {
    try {
      // Validar que sea una imagen
      this.validateImageFile(file)

      console.log(`📋 Subiendo archivo en modo: ${isDevelopment ? "DESARROLLO" : "PRODUCCIÓN"}`)

      if (isDevelopment) {
        // En desarrollo: guardar localmente
        return await this.moveFileLocally(file, options)
      } else {
        // En producción: subir al servidor remoto
        return await this.uploadToRemoteServer(file, options)
      }
    } catch (error) {
      // Limpiar archivo temporal en caso de error
      try {
        if (fs.existsSync(file.path)) {
          await fs.promises.unlink(file.path)
        }
      } catch (cleanupError) {
        console.warn("⚠️ Error al limpiar archivo temporal:", cleanupError)
      }

      throw new Error(`Error al subir imagen: ${error}`)
    }
  }

  /**
   * Elimina una imagen (funciona en desarrollo y producción)
   */
  public async deleteFile(filename: string, options: UploadOptions): Promise<boolean> {
    try {
      const moduleFolder = MODULE_FOLDERS[options.module]

      if (isDevelopment) {
        // En desarrollo: eliminar archivo local
        const localPath = path.join(LOCAL_SERVER_CONFIG.uploadPath, moduleFolder, "images", filename)

        if (fs.existsSync(localPath)) {
          await fs.promises.unlink(localPath)
          console.log(`🗑️ Archivo eliminado localmente: ${localPath}`)
          return true
        }
        return false
      } else {
        // En producción: eliminar del servidor remoto
        let sshClient: Client | null = null

        try {
          sshClient = await this.connectSSH()
          const remotePath = path.posix.join(REMOTE_SERVER_CONFIG.uploadPath, moduleFolder, "images", filename)

          return new Promise((resolve) => {
            sshClient!.sftp((err, sftp) => {
              if (err) {
                console.error("❌ Error SFTP:", err)
                resolve(false)
                return
              }

              sftp.unlink(remotePath, (unlinkErr) => {
                if (unlinkErr) {
                  console.error("❌ Error al eliminar archivo:", unlinkErr)
                  resolve(false)
                } else {
                  console.log(`🗑️ Archivo eliminado del servidor remoto: ${remotePath}`)
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
    } catch (error) {
      console.error("❌ Error al eliminar archivo:", error)
      return false
    }
  }
}

// Exportar instancia singleton
export const remoteFileUploadService = RemoteFileUploadService.getInstance()
