import { Router } from "express"
import { MaquinariaController } from "../../controllers/maquinaria/maquinaria.controller.js"
import {
  createMaquinariaValidation,
  updateMaquinariaValidation,
} from "../../validations/maquinaria/maquinaria.validations.js"

const router = Router()
const maquinariaController = new MaquinariaController()

// Buscar maquinarias por marca
router.get("/buscar/marca", maquinariaController.buscarPorMarca)

// Buscar maquinarias por grupo
router.get("/buscar/grupo", maquinariaController.buscarPorGrupo)

// Obtener una maquinaria por patente
router.get("/patente/:patente", maquinariaController.findByPatente)

// Obtener todas las maquinarias - debe ir antes de /:id para evitar conflictos
router.get("/", maquinariaController.findAll)

// Obtener una maquinaria por ID
router.get("/:id", maquinariaController.findOne)

// Crear una nueva maquinaria
router.post("/", createMaquinariaValidation, maquinariaController.create)

// Actualizar una maquinaria
router.put("/:id", updateMaquinariaValidation, maquinariaController.update)

// Eliminar una maquinaria
router.delete("/:id", maquinariaController.remove)

export default router
