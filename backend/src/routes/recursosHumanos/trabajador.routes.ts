import { Router } from "express";
import { authenticateJWT } from "../../middlewares/authentication.middleware.js";
import { verifyRole } from "../../middlewares/authorization.middleware.js";
import {
  getTrabajadores,
  createTrabajador,
  updateTrabajador,
  desvincularTrabajador,
  reactivarTrabajador
} from "../../controllers/recursosHumanos/trabajador.controller.js";

const router = Router();

// Solo RecursosHumanos, Administrador y SuperAdministrador pueden acceder a estas rutas
router.use(authenticateJWT, verifyRole(["RecursosHumanos", "Administrador", "SuperAdministrador"]));

// Buscar y listar trabajadores (con o sin filtros)
router.get("/", getTrabajadores);

// Crear trabajador
router.post("/", createTrabajador);

// Actualizar trabajador
router.put("/:id", updateTrabajador);

// Reactivar trabajador desvinculado (revinculación)
router.patch("/:id/reactivar", reactivarTrabajador);

// Desvincular trabajador (soft delete)
router.delete("/:id", desvincularTrabajador);

export default router; 