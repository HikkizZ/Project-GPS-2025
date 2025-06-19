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
import { upload } from "../../config/fileUpload.config.js";

const router: Router = Router();

// Rutas protegidas - requieren autenticación
router.use(authenticateJWT);

// Ruta para obtener la ficha propia del usuario
router.get("/mi-ficha", getMiFicha);

// Rutas que requieren rol de RRHH, Admin o Superadministrador
router.use(verifyRole(["RecursosHumanos", "Administrador", "Superadministrador"]));

router
    .get("/search", getFichasEmpresa)
    .get("/:id", getFichaEmpresa)
    .get("/:id/contrato", descargarContrato)
    .put("/:id", updateFichaEmpresa)
    .put("/:id/estado", actualizarEstadoFicha)
    .post("/:id/upload-contrato", upload.single('contrato'), uploadContrato)
    .delete("/:id/delete-contrato", deleteContrato);

export default router; 