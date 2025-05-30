import { Router } from "express";
import { authenticateJWT } from "../../middlewares/authentication.middleware.js";
import { verifyRole } from "../../middlewares/authorization.middleware.js";
import {
    createHistorialLaboral,
    getHistorialLaboral,
    updateHistorialLaboral,
    descargarContrato
} from "../../controllers/recursosHumanos/historialLaboral.controller.js";

const router: Router = Router();

// Rutas protegidas - requieren autenticación
router.use(authenticateJWT);

// Rutas específicas para trabajadores
router.get("/mi-historial", getHistorialLaboral);

// Rutas que requieren rol de RRHH
router.use("/trabajador", verifyRole(["RecursosHumanos"]));
router.use("/", verifyRole(["RecursosHumanos"]));

router
    .post("/", createHistorialLaboral)
    .put("/:id", updateHistorialLaboral)
    .get("/trabajador/:id", getHistorialLaboral)
    .get("/:id/contrato", descargarContrato);

export default router; 