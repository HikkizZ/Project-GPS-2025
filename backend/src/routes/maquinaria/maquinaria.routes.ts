import { Router } from "express";
import { MaquinariaController } from "../../controllers/maquinaria/maquinaria.controller.js";
import { updateMaquinariaValidation, idValidation, patenteValidation, actualizarKilometrajeValidation, cambiarEstadoValidation } from "../../validations/maquinaria/maquinaria.validations.js";
import { authenticateJWT } from "../../middlewares/authentication.middleware.js";
import { verifyRole } from "../../middlewares/authorization.middleware.js";
import { generalUploadMiddleware, handleMulterError } from "../../middlewares/fileUpload.middleware.js";

const router = Router();
const maquinariaController = new MaquinariaController();

router.get("/", authenticateJWT, verifyRole(["Arriendo", "Mecánico", "Mantenciones de Maquinaria"]), maquinariaController.findAll);
router.get("/disponible", authenticateJWT, verifyRole(["Arriendo", "Mecánico", "Mantenciones de Maquinaria"]), maquinariaController.obtenerDisponible);
router.get("/patente/:patente", authenticateJWT, verifyRole(["Arriendo", "Mecánico", "Mantenciones de Maquinaria"]), patenteValidation, maquinariaController.findByPatente);
router.get("/:id", authenticateJWT, verifyRole(["Arriendo", "Mecánico", "Mantenciones de Maquinaria"]), idValidation, maquinariaController.findOne);
router.put("/:id", authenticateJWT, verifyRole(["Arriendo", "Mecánico", "Mantenciones de Maquinaria"]), generalUploadMiddleware.single("padron"), handleMulterError, idValidation, updateMaquinariaValidation, maquinariaController.update);
router.delete("/:id", authenticateJWT, verifyRole(["Arriendo", "Mecánico", "Mantenciones de Maquinaria"]), idValidation, maquinariaController.remove);
router.patch("/:id/kilometraje", authenticateJWT, verifyRole(["Arriendo", "Mecánico", "Mantenciones de Maquinaria"]), actualizarKilometrajeValidation, maquinariaController.actualizarKilometraje);
router.patch("/:id/estado", authenticateJWT, verifyRole(["Arriendo", "Mecánico", "Mantenciones de Maquinaria"]), cambiarEstadoValidation, maquinariaController.cambiarEstado);
router.patch("/:id/soft-delete", authenticateJWT, verifyRole(["SuperAdministrador"]), idValidation, maquinariaController.softRemove);
router.patch("/:id/restore", authenticateJWT, verifyRole(["SuperAdministrador"]), idValidation, maquinariaController.restore);
router.patch("/:id/padron", authenticateJWT, verifyRole(["Arriendo", "Mecánico", "Mantenciones de Maquinaria"]), generalUploadMiddleware.single("padron"), handleMulterError, idValidation, maquinariaController.actualizarPadron);
router.delete("/:id/padron", authenticateJWT, verifyRole(["Arriendo", "Mecánico", "Mantenciones de Maquinaria"]), idValidation, maquinariaController.eliminarPadron);

export default router;
