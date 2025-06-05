import { Router } from "express"
import type { ConductorController } from "../../controllers/maquinaria/conductor.controller.js"
import { validarCrearConductor, validarActualizarConductor } from "../../validations/maquinaria/conductor.validations.js"

export const conductorRoutes = (conductorController: ConductorController): Router => {
  const router = Router()

  // CRUD básico
  router.post("/", validarCrearConductor, conductorController.crear)
  router.get("/", conductorController.obtenerTodos)
  router.get("/buscar", conductorController.buscar)
  router.get("/estadisticas", conductorController.obtenerEstadisticas)
  router.get("/:id", conductorController.obtenerPorId)
  router.get("/rut/:rut", conductorController.obtenerPorRut)
  router.put("/:id", validarActualizarConductor, conductorController.actualizar)
  router.delete("/:id", conductorController.eliminar)

  // Gestión de maquinarias
  router.post("/:id/maquinarias", conductorController.asignarMaquinaria)
  router.delete("/:id/maquinarias", conductorController.desasignarMaquinaria)

  return router
}