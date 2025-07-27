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

// Aplicar autenticación a todas las rutas
router.use(authenticateJWT);

// Buscar y listar trabajadores (con o sin filtros)
// Acceso amplio para lectura: RecursosHumanos, Administrador, SuperAdministrador y Mantenciones de Maquinaria
router.get("/", verifyRole(["RecursosHumanos", "Administrador", "SuperAdministrador", "Mantenciones de Maquinaria"]), getTrabajadores);

// Crear trabajador
// Solo RecursosHumanos, Administrador y SuperAdministrador pueden crear trabajadores
router.post("/", verifyRole(["RecursosHumanos", "Administrador", "SuperAdministrador"]), createTrabajador);

// Actualizar trabajador
// Solo RecursosHumanos, Administrador y SuperAdministrador pueden actualizar trabajadores
router.put("/:id", verifyRole(["RecursosHumanos", "Administrador", "SuperAdministrador"]), updateTrabajador);

// Reactivar trabajador desvinculado (revinculación)
// Solo RecursosHumanos, Administrador y SuperAdministrador pueden reactivar trabajadores
router.patch("/:id/reactivar", verifyRole(["RecursosHumanos", "Administrador", "SuperAdministrador"]), reactivarTrabajador);

// Desvincular trabajador (soft delete)
// Solo RecursosHumanos, Administrador y SuperAdministrador pueden desvincular trabajadores
router.delete("/:id", verifyRole(["RecursosHumanos", "Administrador", "SuperAdministrador"]), desvincularTrabajador);

export default router;