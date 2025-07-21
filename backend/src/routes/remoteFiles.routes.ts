import { Router } from "express"
import {
  downloadRemoteFile,
  uploadRemoteFile,
  deleteRemoteFile,
  listRemoteFiles,
} from "../controllers/remoteFiles.controller.js"
import {
  uploadAndProcessPadron,
  uploadAndProcessContrato,
  uploadAndProcessLicencia,
  uploadAndProcessCertificado,
  uploadAndProcessGeneral,
} from "../middlewares/remoteUpload.middleware.js"
import { authenticateJWT } from "../middlewares/authentication.middleware.js"

const router = Router()

// Aplicar autenticación a todas las rutas
router.use(authenticateJWT)

// Rutas para subir archivos específicos
router.post("/upload/padron", uploadAndProcessPadron, uploadRemoteFile)
router.post("/upload/contrato", uploadAndProcessContrato, uploadRemoteFile)
router.post("/upload/licencia", uploadAndProcessLicencia, uploadRemoteFile)
router.post("/upload/certificado", uploadAndProcessCertificado, uploadRemoteFile)
router.post("/upload/general", uploadAndProcessGeneral, uploadRemoteFile)

// Rutas para gestión de archivos
router.get("/download/:folder/:filename", downloadRemoteFile)
router.delete("/delete/:folder/:filename", deleteRemoteFile)
router.get("/list/:folder", listRemoteFiles)

// Ruta para obtener URL pública de un archivo
router.get("/url/:folder/:filename", (req, res) => {
  const { folder, filename } = req.params

  if (!folder || !filename) {
    return res.status(400).json({
      success: false,
      message: "Carpeta y nombre de archivo son requeridos",
    })
  }

  const url = `http://146.83.198.35:1220/uploads/${folder}/${filename}`

  res.json({
    success: true,
    data: {
      url,
      folder,
      filename,
    },
  })
})

export default router
