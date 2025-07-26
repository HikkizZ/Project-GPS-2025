import { Router } from "express"
import { ArriendoMaquinariaController } from "../../controllers/maquinaria/arriendoMaquinaria.controller.js"
import {
  crearArriendoValidation,
  actualizarArriendoValidation,
  idValidation,
  patenteValidation,
  rutClienteValidation,
  fechaRangoValidation,
} from "../../validations/maquinaria/arriendoMaquinaria.validations.js"
import { authenticateJWT } from "../../middlewares/authentication.middleware.js"
import { verifyRole } from "../../middlewares/authorization.middleware.js"

const router = Router()
const arriendoController = new ArriendoMaquinariaController()

// Rutas CRUD básicas
router.post("/", authenticateJWT, verifyRole(["arriendo"]), crearArriendoValidation, arriendoController.crearReporteTrabajo)
router.get("/", authenticateJWT, verifyRole(["arriendo"]), arriendoController.obtenerTodosLosReportes)
router.get("/patente/:patente", authenticateJWT, verifyRole(["arriendo"]), patenteValidation, arriendoController.obtenerReportesPorPatente)
router.get("/cliente/:rutCliente", authenticateJWT, verifyRole(["arriendo"]), rutClienteValidation, arriendoController.obtenerReportesPorCliente)
router.get("/fecha", authenticateJWT, verifyRole(["arriendo"]), fechaRangoValidation, arriendoController.obtenerReportesPorFecha)
router.get("/:id", authenticateJWT, verifyRole(["arriendo"]), idValidation, arriendoController.obtenerReportePorId)
router.put("/:id", authenticateJWT, verifyRole(["arriendo"]), actualizarArriendoValidation, arriendoController.actualizarReporte)
router.delete("/:id", authenticateJWT, verifyRole(["arriendo"]), idValidation, arriendoController.eliminarReporte)

export default router
