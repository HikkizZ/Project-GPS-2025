import { Router } from "express";
import { authenticateJWT } from "../../middlewares/authentication.middleware.js";
import { verifyRole } from "../../middlewares/authorization.middleware.js";
import { procesarCambioLaboral } from "../../controllers/recursosHumanos/cambiosLaborales.controller.js";

const router: Router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateJWT);

// Todas las rutas requieren rol de RRHH
router.use(verifyRole(["RecursosHumanos"]));

// Ruta para procesar cambios laborales
router.post("/procesar", procesarCambioLaboral);

export default router; 