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

router.post("/", authenticateJWT, verifyRole(["Arriendo"]), crearArriendoValidation, arriendoController.crearReporteTrabajo)
router.get("/", authenticateJWT, verifyRole(["Arriendo"]), arriendoController.obtenerTodosLosReportes)
router.get("/patente/:patente", authenticateJWT, verifyRole(["Arriendo"]), patenteValidation, arriendoController.obtenerReportesPorPatente)
router.get("/cliente/:rutCliente", authenticateJWT, verifyRole(["Arriendo"]), rutClienteValidation, arriendoController.obtenerReportesPorCliente)
router.get("/fecha", authenticateJWT, verifyRole(["Arriendo"]), fechaRangoValidation, arriendoController.obtenerReportesPorFecha)
router.get("/:id", authenticateJWT, verifyRole(["Arriendo"]), idValidation, arriendoController.obtenerReportePorId)
router.put("/:id", authenticateJWT, verifyRole(["Arriendo"]), actualizarArriendoValidation, arriendoController.actualizarReporte)
router.delete("/:id", authenticateJWT, verifyRole(["SuperAdministrador"]), idValidation, arriendoController.eliminarReporte)
router.patch("/:id/restaurar", authenticateJWT, verifyRole(["SuperAdministrador"]), idValidation, arriendoController.restaurarReporte)
router.get("/maquinaria/:maquinariaId/verificar-kilometraje", authenticateJWT, verifyRole(["SuperAdministrador", "arriendo"]), arriendoController.verificarIntegridadKilometraje)
router.patch("/maquinaria/:maquinariaId/corregir-kilometraje", authenticateJWT, verifyRole(["SuperAdministrador"]), arriendoController.corregirKilometraje)

export default router
