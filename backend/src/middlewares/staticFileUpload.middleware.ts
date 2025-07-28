import express from "express"
import path from "path"
import { isDevelopment, LOCAL_SERVER_CONFIG } from "../config/remoteServer.config.js"

/**
 * Middleware para servir archivos estáticos en desarrollo
 * En producción, Apache se encarga de servir los archivos
 */
export function setupStaticFiles(app: express.Application): void {
  if (isDevelopment) {
    // Servir archivos desde la carpeta uploads en desarrollo
    const uploadsPath = path.resolve(LOCAL_SERVER_CONFIG.uploadPath)

    app.use("/uploads", express.static(uploadsPath))

    console.log(`Sirviendo archivos estáticos desde: ${uploadsPath}`)
    console.log(`URL base: ${LOCAL_SERVER_CONFIG.baseUrl}`)
  } else {
    console.log("Modo producción: archivos servidos por Apache")
  }
}
