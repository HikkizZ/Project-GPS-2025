import { Router } from "express"
import { ArriendoMaquinariaController } from "../../controllers/maquinaria/arriendoMaquinaria.controller.js"
import {
  crearArriendoValidation,
  actualizarArriendoValidation,
  finalizarArriendoValidation,
  idValidation,
  fechaValidation,
  fechaRangoValidation,
} from "../../validations/maquinaria/arriendoMaquinaria.validations.js"

const router = Router()
const arriendoController = new ArriendoMaquinariaController()

// Rutas CRUD básicas
router.post("/", crearArriendoValidation, arriendoController.crearArriendo)
router.get("/", arriendoController.obtenerTodosLosArriendos)
router.get("/fecha/:fecha", fechaValidation, arriendoController.obtenerArriendosPorFecha)
router.get("/rango-fecha", fechaRangoValidation, arriendoController.obtenerArriendosPorRangoFecha)
router.get("/ingresos", fechaRangoValidation, arriendoController.obtenerIngresosPorPeriodo)
router.get("/cliente/:clienteId", idValidation, arriendoController.obtenerArriendosPorCliente)
router.get("/conductor/:conductorId", idValidation, arriendoController.obtenerArriendosPorConductor)
router.get("/maquinaria/:maquinariaId", idValidation, arriendoController.obtenerArriendosPorMaquinaria)
router.get("/obra/:obra", arriendoController.obtenerArriendosPorObra)
router.get("/:id", idValidation, arriendoController.obtenerArriendoPorId)
router.put("/:id", idValidation, actualizarArriendoValidation, arriendoController.actualizarArriendo)
router.delete("/:id", idValidation, arriendoController.eliminarArriendo)

// Rutas para operaciones específicas
router.patch("/:id/finalizar", idValidation, finalizarArriendoValidation, arriendoController.finalizarArriendo)

export default router
