import { Router } from "express"
import { VentaMaquinariaController } from "../../controllers/maquinaria/ventaMaquinaria.controller.js"
import {
  registrarVentaValidation,
  ventaIdValidation,
  patenteValidation,
  fechaRangoValidation,
  compradorValidation,
} from "../../validations/maquinaria/ventaMaquinaria.validations.js"

const router = Router()
const ventaMaquinariaController = new VentaMaquinariaController()

// Rutas principales
router.post("/", registrarVentaValidation, ventaMaquinariaController.registrarVenta)
router.get("/", ventaMaquinariaController.obtenerTodasLasVentas)
router.get("/fecha", fechaRangoValidation, ventaMaquinariaController.obtenerVentasPorFecha)
router.get("/patente/:patente", patenteValidation, ventaMaquinariaController.obtenerVentasPorPatente)
router.get("/comprador/:comprador", compradorValidation, ventaMaquinariaController.obtenerVentasPorComprador)
router.get("/:id", ventaIdValidation, ventaMaquinariaController.obtenerVentaPorId)

export default router