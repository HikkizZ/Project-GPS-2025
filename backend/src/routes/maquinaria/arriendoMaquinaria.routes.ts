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

const router = Router()
const arriendoController = new ArriendoMaquinariaController()

// Rutas CRUD básicas
router.post("/", crearArriendoValidation, arriendoController.crearReporteTrabajo)
router.get("/", arriendoController.obtenerTodosLosReportes)
router.get("/patente/:patente", patenteValidation, arriendoController.obtenerReportesPorPatente)
router.get("/cliente/:rutCliente", rutClienteValidation, arriendoController.obtenerReportesPorCliente)
router.get("/fecha", fechaRangoValidation, arriendoController.obtenerReportesPorFecha)
router.get("/:id", idValidation, arriendoController.obtenerReportePorId)
router.put("/:id", idValidation, actualizarArriendoValidation, arriendoController.actualizarReporte)
router.delete("/:id", idValidation, arriendoController.eliminarReporte)

export default router