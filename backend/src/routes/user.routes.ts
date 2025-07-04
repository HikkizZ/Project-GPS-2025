import { Router, Request, Response } from "express";
import { authenticateJWT } from "../middlewares/authentication.middleware.js";
import { getUsers, updateUser } from "../controllers/user.controller.js";

const router = Router();

// Ruta única para listar y buscar usuarios (con o sin filtros)
router.get("/", authenticateJWT, async (req: Request, res: Response) => {
    await getUsers(req, res);
});

// Actualizar usuario por ID
router.put("/:id", authenticateJWT, async (req: Request, res: Response) => {
    await updateUser(req, res);
});

export default router;