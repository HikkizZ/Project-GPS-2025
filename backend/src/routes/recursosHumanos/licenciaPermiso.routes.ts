import { Router } from "express";
import { authenticateJWT } from "../../middlewares/authentication.middleware.js";
import { verifyRole } from "../../middlewares/authorization.middleware.js";
import { FileUploadService } from "../../services/fileUpload.service.js";
import {
    getLicenciaPermisoById,
    getAllLicenciasPermisos,
    getMisSolicitudes,
    createLicenciaPermiso,
    updateLicenciaPermiso,
    deleteLicenciaPermiso,
    descargarArchivoLicencia,
    verificarLicenciasVencidas
} from "../../controllers/recursosHumanos/licenciaPermiso.controller.js";

const router: Router = Router();

// Rutas protegidas - requieren autenticación
router.use(authenticateJWT);

// Rutas para usuarios
router.post("/", FileUploadService.uploadSingle('archivo'), createLicenciaPermiso); // Crear solicitud con subida de archivo
router.get("/mis-solicitudes", getMisSolicitudes); // Ver propias solicitudes

// Rutas para RRHH y Gerencia
router.get("/", verifyRole(["RecursosHumanos"]), getAllLicenciasPermisos); // Ver todas las solicitudes
router.get("/:id", getLicenciaPermisoById); // Ver una solicitud específica
router.put("/:id", verifyRole(["RecursosHumanos"]), updateLicenciaPermiso); // Aprobar/Rechazar solicitud (solo RRHH)
router.delete("/:id", verifyRole(["RecursosHumanos"]), deleteLicenciaPermiso); // Eliminar solicitud (solo RRHH)
router.get("/:id/archivo", descargarArchivoLicencia);
router.post("/verificar-vencimientos", verifyRole(["RecursosHumanos"]), verificarLicenciasVencidas);

export default router; 