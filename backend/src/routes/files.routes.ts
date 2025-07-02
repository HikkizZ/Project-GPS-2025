import { Router } from "express";
import { authenticateJWT } from "../middlewares/authentication.middleware.js";
import { downloadFile } from "../controllers/files.controller.js";

const router: Router = Router();

// Rutas protegidas - requieren autenticación
router.use(authenticateJWT);

// Ruta para descarga segura de archivos
router.get("/*", downloadFile);

export default router; 