import { Router } from "express";
import {
  getMaintenanceSpareParts,
  getMaintenanceSparePartById,
  createMaintenanceSpare,
  updateMaintenanceSpare,
  deleteMaintenanceSpare
} from "../../controllers/MachineryMaintenance/maintenanceSparePart.controller.js";
import { authenticateJWT } from "../../middlewares/authentication.middleware.js";
import { verifyRole } from "../../middlewares/authorization.middleware.js";


const router: Router = Router();

router.use(authenticateJWT);
router.use(verifyRole(["Administrador", "SuperAdministrador", "Mecánico", "Mantenciones de Maquinaria"]));

router
  .get("/all", getMaintenanceSpareParts)
  .get("/", getMaintenanceSparePartById)
  .post("/", createMaintenanceSpare)
  .patch("/", updateMaintenanceSpare)
  .delete("/", deleteMaintenanceSpare);

export default router;
