import { Router } from "express";
import { authenticateJWT } from "../../middlewares/authentication.middleware.js";
import { verifyRole } from "../../middlewares/authorization.middleware.js";
import {
    createTrabajador,
    getTrabajadores,
    searchTrabajadores,
    updateTrabajador,
    deleteTrabajador,
    desvincularTrabajador
} from "../../controllers/recursosHumanos/trabajador.controller.js";
import { verifyToken } from '../../middlewares/auth.middleware.js';
import { checkRole } from '../../middlewares/roles.middleware.js';

const router: Router = Router();

// Rutas protegidas - requieren autenticación
router.use(authenticateJWT);

// Todas las rutas requieren rol de RRHH
router.use(verifyRole(["RecursosHumanos", "Administrador"]));

router
    .post("/", createTrabajador)
    .get("/all", getTrabajadores)
    .get("/detail/", searchTrabajadores)
    .put("/:id", updateTrabajador)
    .delete("/:id", deleteTrabajador)
    .post("/:id/desvincular", desvincularTrabajador);

export default router; 