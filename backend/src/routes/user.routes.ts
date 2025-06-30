import { Router, Request, Response } from "express";
import { authenticateJWT } from "../middlewares/authentication.middleware.js";
import { verifyRole } from "../middlewares/authorization.middleware.js";
import { searchUsers, getUser, getUsers, updateUser, updateUserByTrabajador } from "../controllers/user.controller.js";

const router = Router();

// Rutas de usuario
router.get("/search", authenticateJWT, async (req: Request, res: Response) => {
    await searchUsers(req, res);
});

router.get("/:id", authenticateJWT, async (req: Request, res: Response) => {
    await getUser(req, res);
});

router.get("/", authenticateJWT, async (req: Request, res: Response) => {
    await getUsers(req, res);
});

router.put("/:id", authenticateJWT, async (req: Request, res: Response) => {
    await updateUser(req, res);
});

router.put("/trabajador/:id", authenticateJWT, verifyRole(['RecursosHumanos', 'Administrador']), async (req: Request, res: Response) => {
    await updateUserByTrabajador(req, res);
});

export default router;