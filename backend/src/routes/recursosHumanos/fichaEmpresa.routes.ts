import { Router } from "express";
import { authenticateJWT } from "../../middlewares/authentication.middleware.js";
import { verifyRole } from "../../middlewares/authorization.middleware.js";
import {
    getFichasEmpresa,
    updateFichaEmpresa,
    descargarContrato,
    getMiFicha,
    uploadContrato,
    deleteContrato,
    asignarBono,
    verificarEstadoAsignacionBono,
    updateAsignacionBono,
    getAsignacionesByFicha
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
    .patch("/:id", FileUploadService.uploadSingle('contrato'), updateFichaEmpresa)
    .delete("/:id/contrato", deleteContrato);

    // Asignación de bonos
router.post("/:idFicha/asignar", asignarBono); // Asignar bono a la ficha de empresa de un trabajador
router.get("/:idFicha/asignaciones", getAsignacionesByFicha); // Obtener asignaciones de bonos por ficha de empresa
router.post("/:idFicha/asignaciones/verificar", verifyRole(["RecursosHumanos", "Administrador", "SuperAdministrador"]), verificarEstadoAsignacionBono);
router.put("/:idFicha/asignaciones/:asignacionId", updateAsignacionBono); // Actualizar asignación de bono

export default router; 