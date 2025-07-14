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

const router = Router()
const compraMaquinariaController = new CompraMaquinariaController()

// Rutas principales
router.post("/", uploadPadron, registrarCompraValidation, compraMaquinariaController.registrarCompra)
router.get("/", compraMaquinariaController.obtenerTodasLasCompras)
router.get("/total", fechaRangoValidation, compraMaquinariaController.obtenerTotalCompras)
router.get("/fecha", fechaRangoValidation, compraMaquinariaController.obtenerComprasPorFecha)
router.get("/maquinaria/:maquinariaId", maquinariaIdValidation, compraMaquinariaController.obtenerComprasPorMaquinaria)
router.get("/:id", compraIdValidation, compraMaquinariaController.obtenerCompraPorId)
router.put(
  "/:id",
  uploadPadron,
  compraIdValidation,
  actualizarCompraValidation,
  compraMaquinariaController.actualizarCompra,
)

// RUTA DELETE /:id ELIMINADA - Ya no se puede eliminar compras completas

// Ruta específica para eliminar solo el padrón
router.delete("/:id/padron", compraIdValidation, compraMaquinariaController.eliminarPadron)

export default router
