import { Router } from "express"
import { ClienteMaquinariaController } from "../../controllers/maquinaria/clienteMaquinaria.controller.js"
import {
  createClienteMaquinariaValidation,
  updateClienteMaquinariaValidation,
  idValidation,
  rutValidation,
  searchValidation,
} from "../../validations/maquinaria/clienteMaquinaria.validations.js"
import { authenticateJWT } from "../../middlewares/authentication.middleware.js"
import { verifyRole } from "../../middlewares/authorization.middleware.js"

const router = Router()
const clienteMaquinariaController = new ClienteMaquinariaController()

// Rutas CRUD básicas
router.post("/", createClienteMaquinariaValidation, clienteMaquinariaController.create)
router.get("/", clienteMaquinariaController.findAll)
router.get("/search", searchValidation, clienteMaquinariaController.searchByName)
router.get("/rut/:rut", rutValidation, clienteMaquinariaController.findByRut)
router.get("/:id", idValidation, clienteMaquinariaController.findOne)
router.put("/:id", idValidation, updateClienteMaquinariaValidation, clienteMaquinariaController.update)
router.delete("/:id", idValidation, clienteMaquinariaController.remove)

export default router
