import { Router } from "express"
import { VentaMaquinariaController } from "../../controllers/maquinaria/ventaMaquinaria.controller.js"
import {
  registrarVentaValidation,
  actualizarVentaValidation,
  ventaIdValidation,
  maquinariaIdValidation,
  fechaRangoValidation,
} from "../../validations/maquinaria/ventaMaquinaria.validations.js"

const router = Router()
const ventaMaquinariaController = new VentaMaquinariaController()

// Rutas principales
router.post("/", registrarVentaValidation, ventaMaquinariaController.registrarVenta)
router.get("/", ventaMaquinariaController.obtenerTodasLasVentas)
router.get("/total", fechaRangoValidation, ventaMaquinariaController.obtenerTotalVentas)
router.get("/fecha", fechaRangoValidation, ventaMaquinariaController.obtenerVentasPorFecha)
router.get("/maquinaria/:maquinariaId", maquinariaIdValidation, ventaMaquinariaController.obtenerVentasPorMaquinaria)
// ELIMINÉ LA RUTA DE GANANCIA QUE CAUSABA EL ERROR
router.get("/:id", ventaIdValidation, ventaMaquinariaController.obtenerVentaPorId)
router.put("/:id", ventaIdValidation, actualizarVentaValidation, ventaMaquinariaController.actualizarVenta)
router.delete("/:id", ventaIdValidation, ventaMaquinariaController.eliminarVenta)

export default router
