import { Router } from "express";
import { authenticateJWT } from "../../middlewares/authentication.middleware.js";
import { verifyRole } from "../../middlewares/authorization.middleware.js";
import {
    getFichaEmpresa,
    updateFichaEmpresa,
    actualizarEstadoFicha,
    descargarContrato
} from "../../controllers/recursosHumanos/fichaEmpresa.controller.js";

const router: Router = Router();

// Rutas protegidas - requieren autenticación
router.use(authenticateJWT);

router
    .get("/mi-ficha", getFichaEmpresa)
    .get("/", verifyRole(["RecursosHumanos"]), getFichaEmpresa)
    .put("/:id", verifyRole(["RecursosHumanos"]), updateFichaEmpresa)
    .put("/estado/:id", verifyRole(["RecursosHumanos"]), actualizarEstadoFicha)
    .get("/:id/contrato", descargarContrato);

export default router; 