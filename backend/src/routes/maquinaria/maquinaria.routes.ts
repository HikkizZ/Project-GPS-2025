import { Router } from "express"
import { MaquinariaController } from "../../controllers/maquinaria/maquinaria.controller.js"
import {
  createMaquinariaValidation,
  updateMaquinariaValidation,
  idValidation,
  patenteValidation,
  actualizarKilometrajeValidation,
  cambiarEstadoValidation,
} from "../../validations/maquinaria/maquinaria.validations.js"
import { authenticateJWT } from "../../middlewares/authentication.middleware.js"
import { verifyRole } from "../../middlewares/authorization.middleware.js"

const router = Router()
const maquinariaController = new MaquinariaController()

// Rutas CRUD básicas
router.post("/", authenticateJWT, verifyRole(["arriendo", "Mecánico" ,"Mantenciones de Maquinaria"]),createMaquinariaValidation, maquinariaController.create)
router.get("/", authenticateJWT, verifyRole(["arriendo", "Mecánico" ,"Mantenciones de Maquinaria"]),maquinariaController.findAll)
router.get("/disponible", authenticateJWT, verifyRole(["arriendo", "Mecánico" ,"Mantenciones de Maquinaria"]),maquinariaController.obtenerDisponible)
router.get("/patente/:patente", authenticateJWT, verifyRole(["arriendo", "Mecánico" ,"Mantenciones de Maquinaria"]),patenteValidation, maquinariaController.findByPatente)
router.get("/:id", authenticateJWT, verifyRole(["arriendo", "Mecánico" ,"Mantenciones de Maquinaria"]),idValidation, maquinariaController.findOne)
router.put("/:id", authenticateJWT, verifyRole(["arriendo", "Mecánico" ,"Mantenciones de Maquinaria"]),idValidation, updateMaquinariaValidation, maquinariaController.update)
router.delete("/:id", authenticateJWT, verifyRole(["arriendo", "Mecánico" ,"Mantenciones de Maquinaria"]),idValidation, maquinariaController.remove)

// Rutas para operaciones específicas
router.patch("/:id/kilometraje", actualizarKilometrajeValidation, maquinariaController.actualizarKilometraje)
router.patch("/:id/estado", cambiarEstadoValidation, maquinariaController.cambiarEstado)
export default router
