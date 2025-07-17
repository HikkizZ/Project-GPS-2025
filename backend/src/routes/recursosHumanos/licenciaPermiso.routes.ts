import { Router } from "express";
import { authenticateJWT } from "../../middlewares/authentication.middleware.js";
import { verifyRole } from "../../middlewares/authorization.middleware.js";
import { FileUploadService } from "../../services/fileUpload.service.js";
import {
    getAllLicenciasPermisos,
    getMisSolicitudes,
    createLicenciaPermiso,
    updateLicenciaPermiso,
    descargarArchivoLicencia,
    verificarEstadosLicencias
} from "../../controllers/recursosHumanos/licenciaPermiso.controller.js";

const router: Router = Router();

// Rutas protegidas - requieren autenticación
router.use(authenticateJWT);

// Rutas para usuarios
router.post("/", FileUploadService.uploadSingle('archivo'), createLicenciaPermiso); // Crear solicitud con subida de archivo
router.get("/mis-solicitudes", getMisSolicitudes); // Ver propias solicitudes

// Rutas para RRHH, Administradores y SuperAdministradores
router.get("/", verifyRole(["RecursosHumanos", "Administrador", "SuperAdministrador"]), getAllLicenciasPermisos); // Ver todas las solicitudes (con filtros opcionales)
router.put("/:id", verifyRole(["RecursosHumanos", "Administrador", "SuperAdministrador"]), updateLicenciaPermiso); // Aprobar/Rechazar solicitud

router.get("/:id/archivo", descargarArchivoLicencia);
router.post("/verificar-estados", verifyRole(["RecursosHumanos", "Administrador", "SuperAdministrador"]), verificarEstadosLicencias);

export default router; 