import { Router } from "express"
import { CompraMaquinariaController } from "../../controllers/maquinaria/compraMaquinaria.controller.js"
import {
  registrarCompraValidation,
  actualizarCompraValidation,
  compraIdValidation,
  maquinariaIdValidation,
  fechaRangoValidation,
} from "../../validations/maquinaria/compraMaquinaria.validations.js"
import { uploadPadron } from "../../middlewares/upload.middleware.js"
import { authenticateJWT } from "../../middlewares/authentication.middleware.js"
import { verifyRole } from "../../middlewares/authorization.middleware.js"

const router = Router()
const compraMaquinariaController = new CompraMaquinariaController()

// Rutas principales
router.post("/", authenticateJWT, verifyRole(["arriendo"]),uploadPadron, registrarCompraValidation, compraMaquinariaController.registrarCompra)
router.get("/", authenticateJWT, verifyRole(["arriendo"]),compraMaquinariaController.obtenerTodasLasCompras)
router.get("/fecha", authenticateJWT, verifyRole(["arriendo"]),fechaRangoValidation, compraMaquinariaController.obtenerComprasPorFecha)
router.get("/maquinaria/:maquinariaId", authenticateJWT, verifyRole(["arriendo"]),maquinariaIdValidation, compraMaquinariaController.obtenerComprasPorMaquinaria)
router.get("/:id", authenticateJWT, verifyRole(["arriendo"]),compraIdValidation, compraMaquinariaController.obtenerCompraPorId)
router.put("/:id", authenticateJWT, verifyRole(["arriendo"]),uploadPadron,compraIdValidation,actualizarCompraValidation,compraMaquinariaController.actualizarCompra,)
export default router
