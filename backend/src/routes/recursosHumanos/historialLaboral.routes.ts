import { Router } from "express";
import { authenticateJWT } from "../../middlewares/authentication.middleware.js";
import { verifyRole } from "../../middlewares/authorization.middleware.js";
import {
    createHistorialLaboral,
    getHistorialLaboral,
    updateHistorialLaboral,
    descargarContrato,
    procesarCambioLaboral
} from "../../controllers/recursosHumanos/historialLaboral.controller.js";

const router: Router = Router();

// Rutas protegidas - requieren autenticación
router.use(authenticateJWT);

// Rutas para RRHH
router.use(verifyRole(["RRHH"]));

router
    .post("/", createHistorialLaboral)
    .put("/:id", updateHistorialLaboral)
    .get("/trabajador/:id", getHistorialLaboral)
    .get("/:id/contrato", descargarContrato)
    .post("/trabajador/:trabajadorId/cambio", procesarCambioLaboral);

export default router; 