import { Router } from "express";
import { authenticateJWT } from "../../middlewares/authentication.middleware.js";
import { verifyRole } from "../../middlewares/authorization.middleware.js";
import {
    getFichasEmpresa,
    updateFichaEmpresa,
    descargarContrato,
    getMiFicha,
    uploadContrato,
    deleteContrato
} from "../../controllers/recursosHumanos/fichaEmpresa.controller.js";
import { FileUploadService } from "../../services/fileUpload.service.js";

const router: Router = Router();

// Rutas protegidas - requieren autenticación
router.use(authenticateJWT);

// Ruta para obtener la ficha propia del usuario
router.get("/mi-ficha", getMiFicha);

// Rutas que requieren rol de RRHH, Admin o SuperAdministrador
router.use(verifyRole(["RecursosHumanos", "Administrador", "SuperAdministrador"]));

router
    .get("/", getFichasEmpresa)
    .get("/:id/contrato", descargarContrato)
    .put("/:id", updateFichaEmpresa)
    .post("/:id/upload-contrato", FileUploadService.uploadSingle('contrato'), uploadContrato)
    .delete("/:id/contrato", deleteContrato);

export default router; 