import { Router } from "express"
import type { VentaMaquinariaController } from "../../controllers/maquinaria/ventaMaquinaria.controller.js"
import {
  validarCrearVentaMaquinaria,
  validarActualizarVentaMaquinaria,
  validarTransferirAVentas,
  validarCompletarVenta,
} from "../../validations/maquinaria/ventaMaquinaria.validations.js"

export const ventaMaquinariaRoutes = (ventaController: VentaMaquinariaController): Router => {
  const router = Router()

  // CRUD básico
  router.post("/", validarCrearVentaMaquinaria, ventaController.crear)
  router.get("/", ventaController.obtenerTodos)
  router.get("/buscar", ventaController.buscar)
  router.get("/disponibles", ventaController.obtenerVentasDisponibles)
  router.get("/historial", ventaController.obtenerHistorialVentas)
  router.get("/estadisticas", ventaController.obtenerEstadisticas)
  router.get("/:id", ventaController.obtenerPorId)
  router.get("/patente/:patente", ventaController.obtenerPorPatente)
  router.put("/:id", validarActualizarVentaMaquinaria, ventaController.actualizar)
  router.delete("/:id", ventaController.eliminar)

  // Funciones específicas de ventas
  router.post("/transferir", validarTransferirAVentas, ventaController.transferirAVentas)
  router.post("/:id/cancelar", ventaController.cancelarVenta)
  router.post("/:id/completar", validarCompletarVenta, ventaController.completarVenta)
  router.post("/:id/reservar", ventaController.reservarVenta)
  router.post("/:id/liberar-reserva", ventaController.liberarReserva)

  return router
}
