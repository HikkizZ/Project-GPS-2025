import express from "express"
import { authenticateJWT } from "../../middlewares/authentication.middleware.js"
import { verifyRole } from "../../middlewares/authorization.middleware.js"
import { 
  registrarCompraValidation, 
  actualizarCompraValidation, 
  compraIdValidation,
   maquinariaIdValidation, 
   fechaRangoValidation 
  } from "../../validations/maquinaria/compraMaquinaria.validations.js"
import { CompraMaquinariaController } from "../../controllers/maquinaria/compraMaquinaria.controller.js"
import { generalUploadMiddleware, handleMulterError } from "../../middlewares/fileUpload.middleware.js"

const router = express.Router()
const compraMaquinariaController = new CompraMaquinariaController()

router.post("/", authenticateJWT, verifyRole(["Arriendo"]), generalUploadMiddleware.single("padron"), handleMulterError, registrarCompraValidation, compraMaquinariaController.registrarCompra)
router.put("/:id", authenticateJWT, verifyRole(["Arriendo"]), generalUploadMiddleware.single("padron"), handleMulterError, compraIdValidation, actualizarCompraValidation, compraMaquinariaController.actualizarCompra)
router.delete("/:id", authenticateJWT, verifyRole(["SuperAdministrador"]), compraIdValidation, compraMaquinariaController.eliminarCompra)
router.patch("/:id/restaurar", authenticateJWT, verifyRole(["SuperAdministrador"]), compraIdValidation, compraMaquinariaController.restaurarCompra)
router.get("/", authenticateJWT, verifyRole(["Arriendo"]), compraMaquinariaController.obtenerTodasLasCompras)
router.get("/fecha", authenticateJWT, verifyRole(["Arriendo"]), fechaRangoValidation, compraMaquinariaController.obtenerComprasPorFecha)
router.get("/maquinaria/:maquinariaId", authenticateJWT, verifyRole(["Arriendo"]), maquinariaIdValidation, compraMaquinariaController.obtenerComprasPorMaquinaria)
router.get("/:id", authenticateJWT, verifyRole(["Arriendo"]), compraIdValidation, compraMaquinariaController.obtenerCompraPorId)
router.get("/:id/padron", authenticateJWT, verifyRole(["Arriendo"]), compraIdValidation, compraMaquinariaController.obtenerPadronCompra)
router.delete("/:id/padron", authenticateJWT, verifyRole(["SuperAdministrador"]), compraIdValidation, compraMaquinariaController.eliminarPadronCompra)

export default router
