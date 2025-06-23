import { Router } from "express"
import { MaquinariaController } from "../../controllers/maquinaria/maquinaria.controller.js"
import {
  createMaquinariaValidation,
  updateMaquinariaValidation,
  idValidation,
  patenteValidation,
  grupoValidation,
  actualizarKilometrajeValidation,
  cambiarEstadoValidation,
} from "../../validations/maquinaria/maquinaria.validations.js"

const router = Router()
const maquinariaController = new MaquinariaController()

// Rutas CRUD básicas
router.post("/", createMaquinariaValidation, maquinariaController.create)
router.get("/", maquinariaController.findAll)
router.get("/disponible", maquinariaController.obtenerDisponible)
router.get("/grupo/:grupo", grupoValidation, maquinariaController.obtenerPorGrupo)
router.get("/patente/:patente", patenteValidation, maquinariaController.findByPatente)
router.get("/:id", idValidation, maquinariaController.findOne)
router.put("/:id", idValidation, updateMaquinariaValidation, maquinariaController.update)
router.delete("/:id", idValidation, maquinariaController.remove)

// Rutas para operaciones específicas
router.patch("/:id/kilometraje", actualizarKilometrajeValidation, maquinariaController.actualizarKilometraje)
router.patch("/:id/estado", cambiarEstadoValidation, maquinariaController.cambiarEstado)

export default router
