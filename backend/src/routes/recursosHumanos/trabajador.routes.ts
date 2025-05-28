import { Router } from "express";
import { authenticateJWT } from "../../middlewares/authentication.middleware.js";
import { verifyRole } from "../../middlewares/authorization.middleware.js";
import {
    createTrabajador,
    getTrabajadores,
    getTrabajadorById,
    updateTrabajador,
    deleteTrabajador
} from "../../controllers/recursosHumanos/trabajador.controller.js";

const router: Router = Router();

// Rutas protegidas - requieren autenticación
router.use(authenticateJWT);

// Todas las rutas requieren rol de RRHH
router.use(verifyRole(["RecursosHumanos"]));

router
    .post("/", createTrabajador)
    .get("/all", getTrabajadores)
    .get("/:id", getTrabajadorById)
    .put("/:id", updateTrabajador)
    .delete("/:id", deleteTrabajador);

export default router; 