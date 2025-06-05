import { Router } from "express"
import type { MaquinariaController } from "../../controllers/maquinaria/maquinaria.controller.js"
import {
  validarCrearMaquinaria,
  validarActualizarMaquinaria,
  validarActualizarKilometraje,
} from "../../validations/maquinaria/maquinaria.validations.js"

export const maquinariaRoutes = (maquinariaController: MaquinariaController): Router => {
  const router = Router()

  // CRUD básico
  router.post("/", validarCrearMaquinaria, maquinariaController.crear)
  router.get("/", maquinariaController.obtenerTodos)
  router.get("/buscar", maquinariaController.buscar)
  router.get("/estadisticas", maquinariaController.obtenerEstadisticas)
  router.get("/:id", maquinariaController.obtenerPorId)
  router.get("/patente/:patente", maquinariaController.obtenerPorPatente)
  router.put("/:id", validarActualizarMaquinaria, maquinariaController.actualizar)
  router.delete("/:id", maquinariaController.eliminar)

  // Gestión de conductores
  router.post("/:id/conductores", maquinariaController.asignarConductor)
  router.delete("/:id/conductores", maquinariaController.desasignarConductor)

  // Funciones específicas
  router.patch("/:id/kilometraje", validarActualizarKilometraje, maquinariaController.actualizarKilometraje)

  return router
}
