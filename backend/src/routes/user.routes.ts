import { Router, Request, Response } from "express";
import { authenticateJWT } from "../middlewares/authentication.middleware.js";
import { verifyRole } from "../middlewares/authorization.middleware.js";
import { getUsers, updateUser } from "../controllers/user.controller.js";

const router = Router();

// Solo SuperAdministrador, Administrador y RecursosHumanos pueden acceder a estas rutas
const allowedRoles = ["SuperAdministrador", "Administrador", "RecursosHumanos"];

// Ruta única para listar y buscar usuarios (con o sin filtros)
router.get("/", authenticateJWT, verifyRole(allowedRoles), async (req: Request, res: Response) => {
    await getUsers(req, res);
});

// Ruta única para actualizar usuario (por id, rut o corporateEmail)
router.put("/update", authenticateJWT, async (req: Request, res: Response) => {
    await updateUser(req, res);
});

export default router;