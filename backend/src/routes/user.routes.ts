import { Router } from "express";

import { authenticateJWT } from "../middlewares/authentication.middleware.js";

import { getUser, getUsers, updateUser, deleteUser } from "../controllers/user.controller.js";

const router: Router = Router();

router.use(authenticateJWT);

router
    .get("/", getUser)
    .get("/all", getUsers)
    .patch("/", updateUser)
    .delete("/", deleteUser);
export default router;