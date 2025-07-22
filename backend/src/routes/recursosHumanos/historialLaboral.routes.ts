import { Router } from "express";
import { authenticateJWT } from "../../middlewares/authentication.middleware.js";
import { verifyRole } from "../../middlewares/authorization.middleware.js";
import {
    getHistorialLaboral,
    getHistorialUnificado,
    descargarContratoHistorial
} from "../../controllers/recursosHumanos/historialLaboral.controller.js";

const router: Router = Router();

// Rutas protegidas - requieren autenticación
router.use(authenticateJWT);

// Rutas para RRHH
router.use(verifyRole(["SuperAdministrador", "Administrador", "RecursosHumanos"]));

router
    .get("/trabajador/:id", getHistorialLaboral)
    .get("/trabajador/:id/unificado", getHistorialUnificado)
    .get("/:id/contrato", descargarContratoHistorial);

export default router; 