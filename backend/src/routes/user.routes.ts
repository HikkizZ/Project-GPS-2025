import { Router, Request, Response } from "express";
import { authenticateJWT } from "../middlewares/authentication.middleware.js";
import { verifyRole } from "../middlewares/authorization.middleware.js";
import { searchUsers, updateUser, updateUserByTrabajador } from "../controllers/user.controller.js";

const router = Router();

// Ruta única para listar y buscar usuarios (con o sin filtros)
router.get("/", authenticateJWT, async (req: Request, res: Response) => {
    await searchUsers(req, res);
});

// Actualizar usuario por ID
router.put("/:id", authenticateJWT, async (req: Request, res: Response) => {
    await updateUser(req, res);
});

// Actualizar usuario por trabajador (solo RRHH o Administrador)
router.put("/trabajador/:id", authenticateJWT, verifyRole(["RecursosHumanos", "Administrador"]), async (req: Request, res: Response) => {
    await updateUserByTrabajador(req, res);
});

export default router;