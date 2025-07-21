import type { Request, Response } from "express"
import { RemoteFileManagementService } from "../services/remoteFileManagement.service.js"
import { handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js"

/**
 * Controlador para descarga de archivos desde servidor remoto
 */
export async function downloadRemoteFile(req: Request, res: Response): Promise<void> {
  try {
    const { folder, filename } = req.params

    if (!folder || !filename) {
      handleErrorClient(res, 400, "Carpeta y nombre de archivo son requeridos")
      return
    }

    // Validar que el usuario esté autenticado
    if (!req.user) {
      handleErrorClient(res, 401, "Usuario no autenticado")
      return
    }

    // Validar permisos de acceso
    const isAuthorized = await validateRemoteFileAccess(req.user, folder, filename)
    if (!isAuthorized) {
      handleErrorClient(res, 403, "No tiene permisos para acceder a este archivo")
      return
    }

    // Obtener información del archivo remoto
    const [fileInfo, error] = await RemoteFileManagementService.getRemoteFileForDownload(folder, filename)

    if (error || !fileInfo) {
      const errorMessage = error || "Archivo no encontrado"
      handleErrorClient(res, 404, errorMessage)
      return
    }

    if (!fileInfo.exists) {
      handleErrorClient(res, 404, "El archivo no existe en el servidor remoto")
      return
    }

    // Redirigir a la URL pública del archivo
    res.redirect(fileInfo.url)
  } catch (error) {
    console.error("Error en downloadRemoteFile:", error)
    handleErrorServer(res, 500, "Error interno del servidor")
  }
}

/**
 * Controlador para subir archivo al servidor remoto
 */
export async function uploadRemoteFile(req: Request, res: Response): Promise<void> {
  try {
    // Verificar que se haya procesado el archivo remoto
    if (!req.remoteFile) {
      handleErrorClient(res, 400, "No se pudo procesar el archivo")
      return
    }

    // Retornar información del archivo subido
    const result = RemoteFileManagementService.formatUploadResult(req.remoteFile)
    res.status(200).json(result)
  } catch (error) {
    console.error("Error en uploadRemoteFile:", error)
    const errorResult = RemoteFileManagementService.handleUploadError(error)
    res.status(500).json(errorResult)
  }
}

/**
 * Controlador para eliminar archivo del servidor remoto
 */
export async function deleteRemoteFile(req: Request, res: Response): Promise<void> {
  try {
    const { folder, filename } = req.params

    if (!folder || !filename) {
      handleErrorClient(res, 400, "Carpeta y nombre de archivo son requeridos")
      return
    }

    // Validar permisos
    if (!req.user) {
      handleErrorClient(res, 401, "Usuario no autenticado")
      return
    }

    const isAuthorized = await validateRemoteFileAccess(req.user, folder, filename)
    if (!isAuthorized) {
      handleErrorClient(res, 403, "No tiene permisos para eliminar este archivo")
      return
    }

    // Eliminar archivo
    const [deleted, error] = await RemoteFileManagementService.deleteRemoteFile(folder, filename)

    if (error) {
      handleErrorClient(res, 500, error)
      return
    }

    if (deleted) {
      res.status(200).json({
        success: true,
        message: "Archivo eliminado exitosamente",
      })
    } else {
      handleErrorClient(res, 404, "Archivo no encontrado")
    }
  } catch (error) {
    console.error("Error en deleteRemoteFile:", error)
    handleErrorServer(res, 500, "Error interno del servidor")
  }
}

/**
 * Controlador para listar archivos en el servidor remoto
 */
export async function listRemoteFiles(req: Request, res: Response): Promise<void> {
  try {
    const { folder } = req.params

    if (!folder) {
      handleErrorClient(res, 400, "Carpeta es requerida")
      return
    }

    // Validar permisos
    if (!req.user) {
      handleErrorClient(res, 401, "Usuario no autenticado")
      return
    }

    // Listar archivos
    const [files, error] = await RemoteFileManagementService.listRemoteFiles(folder)

    if (error) {
      handleErrorClient(res, 500, error)
      return
    }

    res.status(200).json({
      success: true,
      data: {
        folder: folder,
        files: files.map((filename) => ({
          filename,
          url: RemoteFileManagementService.getRemoteFileUrl(folder, filename),
        })),
      },
    })
  } catch (error) {
    console.error("Error en listRemoteFiles:", error)
    handleErrorServer(res, 500, "Error interno del servidor")
  }
}

/**
 * Valida si el usuario tiene acceso al archivo remoto
 */
async function validateRemoteFileAccess(user: any, folder: string, filename: string): Promise<boolean> {
  try {
    // SuperAdministrador, Administradores y RRHH tienen acceso a todos los archivos
    if (user.role === "SuperAdministrador" || user.role === "Administrador" || user.role === "RecursosHumanos") {
      return true
    }

    // Para usuarios normales, validar según el tipo de archivo
    switch (folder) {
      case "licencias":
        return await validateLicenciaAccess(user, filename)
      case "contratos":
      case "historial":
        return await validateContratoHistorialAccess(user, filename)
      case "certificados":
        return await validateCertificadoAccess(user, filename)
      case "padrones":
        return await validatePadronAccess(user, filename)
      default:
        return false
    }
  } catch (error) {
    console.error("Error al validar acceso a archivo remoto:", error)
    return false
  }
}

/**
 * Validaciones específicas por tipo de archivo
 */
async function validateLicenciaAccess(user: any, filename: string): Promise<boolean> {
  // Implementar lógica específica para validar licencias
  return true
}

async function validateContratoHistorialAccess(user: any, filename: string): Promise<boolean> {
  // Implementar lógica específica para validar contratos/historial
  return true
}

async function validateCertificadoAccess(user: any, filename: string): Promise<boolean> {
  // Implementar lógica específica para validar certificados
  return true
}

async function validatePadronAccess(user: any, filename: string): Promise<boolean> {
  // Implementar lógica específica para validar padrones
  return true
}

export default {
  downloadRemoteFile,
  uploadRemoteFile,
  deleteRemoteFile,
  listRemoteFiles,
}
