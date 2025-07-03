import { Router } from "express";
import { authenticateJWT } from "../../../middlewares/authentication.middleware.js";
import {
    createBono,
    getAllBonos,
    getBonoById,
    updateBono,
    deleteBono
} from "../../../controllers/recursosHumanos/remuneraciones/bono.controller.js";

const router: Router = Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateJWT);

// Rutas para crear bonos (todos los usuarios autenticados)
router.post("/", createBono); // Crear bono 

// Rutas para obtener bonos
router.get("/", getAllBonos); // Obtener bonos (propias para usuarios, todas para RRHH)
router.get("/:id", getBonoById); // Obtener bono por ID

// Rutas para actualizar bonos
router.put("/:id", updateBono); // Actualizar bono (propietario o RRHH)

// Rutas para eliminar bonos
router.delete("/:id", deleteBono); // Eliminar bono (propietario o RRHH)


export default router; 