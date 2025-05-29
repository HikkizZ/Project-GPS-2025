import { Router } from "express";
import { authenticateJWT } from "../../middlewares/authentication.middleware.js";
import { verifyRole } from "../../middlewares/authorization.middleware.js";
import {
    getFichasEmpresa,
    getFichaEmpresa,
    updateFichaEmpresa,
    actualizarEstadoFicha,
    descargarContrato,
    getMiFicha
} from "../../controllers/recursosHumanos/fichaEmpresa.controller.js";

const router: Router = Router();

// Rutas protegidas - requieren autenticación
router.use(authenticateJWT);

// Rutas públicas para usuarios autenticados
router.get("/mi-ficha", getMiFicha);
router.get("/:id/contrato", descargarContrato);

// Rutas protegidas para RRHH
router.use(verifyRole(["RecursosHumanos"]));

router
    .get("/search", getFichasEmpresa)
    .get("/:id", getFichaEmpresa)
    .put("/:id", updateFichaEmpresa)
    .put("/:id/estado", actualizarEstadoFicha);

export default router; 