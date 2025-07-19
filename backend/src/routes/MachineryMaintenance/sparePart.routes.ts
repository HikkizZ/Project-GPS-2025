import { Router } from "express";
import {
  getSpareParts,
  getSparePartById,
  createSpare,
  updateSpare,
  deleteSpare
} from "../../controllers/MachineryMaintenance/sparePart.controller.js";
import { authenticateJWT } from "../../middlewares/authentication.middleware.js";
import { verifyRole } from "../../middlewares/authorization.middleware.js";

const router: Router = Router();

router.use(authenticateJWT);
router.use(verifyRole(["Administrador", "SuperAdministrador", "Mecánico", "Mantenciones de Maquinaria"]));

router
  .get("/", getSpareParts)
  .get("/:id", getSparePartById)
  .post("/", createSpare)
  .patch("/:id", updateSpare)
  .delete("/:id", deleteSpare);

export default router;
