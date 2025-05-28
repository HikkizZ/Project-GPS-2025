import { Router } from "express";
import { authenticateJWT } from "../../middlewares/authentication.middleware.js";
import { verifyRole } from "../../middlewares/authorization.middleware.js";
import {
    createLicenciaPermiso,
    getAllLicenciasPermisos,
    getLicenciaPermisoById,
    updateLicenciaPermiso,
    deleteLicenciaPermiso
} from "../../controllers/recursosHumanos/licenciaPermiso.controller.js";

const router = Router();

// Rutas protegidas - requieren autenticación
router.use(authenticateJWT);

// Rutas para trabajadores
router.post("/", createLicenciaPermiso); // Crear solicitud
router.get("/mis-solicitudes", getAllLicenciasPermisos); // Ver propias solicitudes

// Rutas para RRHH y Gerencia
router.get("/", verifyRole(["RecursosHumanos", "Gerencia"]), getAllLicenciasPermisos); // Ver todas las solicitudes
router.get("/:id", verifyRole(["RecursosHumanos", "Gerencia"]), getLicenciaPermisoById); // Ver una solicitud específica
router.put("/:id", verifyRole(["RecursosHumanos"]), updateLicenciaPermiso); // Aprobar/Rechazar solicitud (solo RRHH)
router.delete("/:id", verifyRole(["RecursosHumanos"]), deleteLicenciaPermiso); // Eliminar solicitud (solo RRHH)

export default router; 