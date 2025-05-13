import { Router } from "express";
import { getUser, getUsers, updateUser, deleteUser } from "../controllers/user.controller.js";

const router: Router = Router();

router
    .get("/", getUser)
    .get("/all", getUsers)
    .patch("/", updateUser)
    .delete("/", deleteUser);
export default router;