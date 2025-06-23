import { Router } from "express"
import { CompraMaquinariaController } from "../../controllers/maquinaria/compraMaquinaria.controller.js"
import {
  registrarCompraValidation,
  actualizarCompraValidation,
  compraIdValidation,
  maquinariaIdValidation,
  fechaRangoValidation,
} from "../../validations/maquinaria/compraMaquinaria.validations.js"

const router = Router()
const compraMaquinariaController = new CompraMaquinariaController()

// Rutas principales
router.post("/", registrarCompraValidation, compraMaquinariaController.registrarCompra)
router.get("/", compraMaquinariaController.obtenerTodasLasCompras)
router.get("/total", fechaRangoValidation, compraMaquinariaController.obtenerTotalCompras)
router.get("/fecha", fechaRangoValidation, compraMaquinariaController.obtenerComprasPorFecha)
router.get("/maquinaria/:maquinariaId", maquinariaIdValidation, compraMaquinariaController.obtenerComprasPorMaquinaria)
router.get("/:id", compraIdValidation, compraMaquinariaController.obtenerCompraPorId)
router.put("/:id", compraIdValidation, actualizarCompraValidation, compraMaquinariaController.actualizarCompra)
router.delete("/:id", compraIdValidation, compraMaquinariaController.eliminarCompra)

export default router
