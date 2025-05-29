import { Router } from "express";
import { getUser, getUsers, updateUser, deleteUser } from "../controllers/user.controller.js";
import { authenticateJWT } from "../middlewares/authentication.middleware.js";
import { verifyRole } from "../middlewares/authorization.middleware.js";

const router = Router();

/* Rutas protegidas - requieren token */
router.use(authenticateJWT);

/* Rutas para usuarios - requieren rol Administrador o RRHH */
router.use(verifyRole(["Administrador", "RecursosHumanos"]));

/* Rutas para usuarios */
router.get("/detail/", getUser);
router.get("/all", getUsers);
router.put("/update/", updateUser);
router.delete("/delete/", deleteUser);

export default router;