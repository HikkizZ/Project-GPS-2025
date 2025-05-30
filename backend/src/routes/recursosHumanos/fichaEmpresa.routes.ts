import { Router } from "express";
import { authenticateJWT } from "../../middlewares/authentication.middleware.js";
import { verifyRole } from "../../middlewares/authorization.middleware.js";
import {
    getFichasEmpresa,
    getFichaEmpresa,
    updateFichaEmpresa,
    actualizarEstadoFicha,
    descargarContrato,
    getMiFicha,
    uploadContrato,
    deleteContrato
} from "../../controllers/recursosHumanos/fichaEmpresa.controller.js";
import { uploadContrato as uploadMiddleware } from "../../config/fileUpload.config.js";

const router: Router = Router();

// Rutas protegidas - requieren autenticación
router.use(authenticateJWT);

// Rutas públicas para usuarios autenticados
router.get("/mi-ficha", getMiFicha);
router.get("/:id/contrato", descargarContrato);

// Rutas protegidas para RRHH y Admin
router.use(verifyRole(["RecursosHumanos", "Administrador"]));

router
    .get("/search", getFichasEmpresa)
    .get("/:id", getFichaEmpresa)
    .put("/:id", updateFichaEmpresa)
    .put("/:id/estado", actualizarEstadoFicha)
    .post("/:id/upload-contrato", uploadMiddleware.single('contrato'), uploadContrato)
    .delete("/:id/delete-contrato", deleteContrato);

export default router; 