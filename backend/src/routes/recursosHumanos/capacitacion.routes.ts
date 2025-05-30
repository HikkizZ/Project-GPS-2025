import { Router } from "express";
import { authenticateJWT } from "../../middlewares/authentication.middleware.js";
import { verifyRole } from "../../middlewares/authorization.middleware.js";
import { uploadPdfWithValidation } from "../../middlewares/fileUpload.middleware.js";
import {
    createCapacitacion,
    getAllCapacitaciones,
    getCapacitacionById,
    getCapacitacionesByTrabajador,
    updateCapacitacion,
    deleteCapacitacion,
    descargarCertificado
} from "../../controllers/recursosHumanos/capacitacion.controller.js";

const router: Router = Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateJWT);

// Rutas para crear capacitaciones (todos los usuarios autenticados)
router.post("/", uploadPdfWithValidation, createCapacitacion); // Crear capacitación con certificado opcional

// Rutas para obtener capacitaciones
router.get("/", getAllCapacitaciones); // Obtener capacitaciones (propias para usuarios, todas para RRHH)
router.get("/mis-capacitaciones", getAllCapacitaciones); // Alias para obtener capacitaciones propias
router.get("/trabajador/:trabajadorId", getCapacitacionesByTrabajador); // Obtener capacitaciones de un trabajador específico
router.get("/:id", getCapacitacionById); // Obtener capacitación por ID

// Rutas para actualizar capacitaciones
router.put("/:id", updateCapacitacion); // Actualizar capacitación (propietario o RRHH)

// Rutas para eliminar capacitaciones
router.delete("/:id", deleteCapacitacion); // Eliminar capacitación (propietario o RRHH)

// Ruta para descargar certificados
router.get("/:id/certificado", descargarCertificado); // Descargar certificado

export default router; 