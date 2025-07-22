import { Router } from "express"
import { VentaMaquinariaController } from "../../controllers/maquinaria/ventaMaquinaria.controller.js"
import {
  registrarVentaValidation,
  ventaIdValidation,
  patenteValidation,
  fechaRangoValidation,
  compradorValidation,
} from "../../validations/maquinaria/ventaMaquinaria.validations.js"
import { authenticateJWT } from "../../middlewares/authentication.middleware.js"
import { verifyRole } from "../../middlewares/authorization.middleware.js"


const router = Router()
const ventaMaquinariaController = new VentaMaquinariaController()

// Rutas principales
router.post("/", authenticateJWT, verifyRole(["arriendo"]),registrarVentaValidation, ventaMaquinariaController.registrarVenta)
router.get("/", authenticateJWT, verifyRole(["arriendo"]),ventaMaquinariaController.obtenerTodasLasVentas)
router.get("/fecha", authenticateJWT, verifyRole(["arriendo"]),fechaRangoValidation, ventaMaquinariaController.obtenerVentasPorFecha)
router.get("/patente/:patente", authenticateJWT, verifyRole(["arriendo"]),patenteValidation, ventaMaquinariaController.obtenerVentasPorPatente)
router.get("/comprador/:comprador", authenticateJWT, verifyRole(["arriendo"]),compradorValidation, ventaMaquinariaController.obtenerVentasPorComprador)
router.get("/:id", ventaIdValidation, authenticateJWT, verifyRole(["arriendo"]),ventaMaquinariaController.obtenerVentaPorId)

export default router