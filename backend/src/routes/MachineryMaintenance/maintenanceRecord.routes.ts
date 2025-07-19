import { Router } from "express";
import {
  getMaintenanceRecords,
  getMaintenanceRecord,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance
} from "../../controllers/MachineryMaintenance/maintenanceRecord.controller.js";
import { authenticateJWT } from "../../middlewares/authentication.middleware.js";
import { verifyRole } from "../../middlewares/authorization.middleware.js";

const router: Router = Router();

router.use(authenticateJWT);
router.use(verifyRole(["Administrador", "SuperAdministrador", "Mecánico", "Mantenciones de Maquinaria"]));


router
  .get("/", getMaintenanceRecords)
  .get("/:id", getMaintenanceRecord)
  .post("/", createMaintenance)
  .patch("/:id", updateMaintenance)
  .delete("/:id", deleteMaintenance);

export default router;
