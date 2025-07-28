import express from "express"
import path from "path"
import {
  isDevelopment,
  LOCAL_SERVER_CONFIG,
  FALLBACK_LOCAL_CONFIG,
  isProduction,
} from "../config/remoteServer.config.js"

/**
 * Middleware para servir archivos estáticos en desarrollo Y fallback en producción
 */
export function setupStaticFiles(app: express.Application): void {
  if (isDevelopment) {
    // Servir archivos desde la carpeta uploads en desarrollo
    const uploadsPath = path.resolve(LOCAL_SERVER_CONFIG.uploadPath)
    app.use("/uploads", express.static(uploadsPath))
    console.log(`📁 Sirviendo archivos estáticos (desarrollo): ${uploadsPath}`)
    console.log(`🌐 URL base: ${LOCAL_SERVER_CONFIG.baseUrl}`)
  } else if (isProduction) {
    // NUEVO: También servir archivos locales en producción (para fallback)
    const fallbackPath = path.resolve(FALLBACK_LOCAL_CONFIG.uploadPath)
    app.use("/uploads", express.static(fallbackPath))
    console.log(`📁 Sirviendo archivos estáticos (fallback producción): ${fallbackPath}`)
    console.log(`🌐 URL base fallback: ${FALLBACK_LOCAL_CONFIG.baseUrl}`)
  } else {
    console.log("Modo producción: archivos servidos por Apache (con fallback local disponible)")
  }
}
