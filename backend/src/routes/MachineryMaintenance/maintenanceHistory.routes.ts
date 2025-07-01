import {Router} from "express";

import {
    createMaintenanceHistory,
    getMaintenanceHistorys,
    getMaintenanceHistory,
    updateMaintenanceHistory,
    deleteMaintenanceHistory
} from '../../controllers/MachineryMaintenance/maintenanceHistory.controller.js';

import { authenticateJWT } from '../../middlewares/authentication.middleware.js';

const router: Router = Router();

router.use(authenticateJWT);

router.use(verifyRole(["Mecánico", "Administrador", "Mantenciones de Maquinaria", "SuperAdministrador"]));

router
  .get("/all", getMaintenanceHistorys)
  .get("/", getMaintenanceHistory)
  .post("/", createMaintenanceHistory)
  .put("/", updateMaintenanceHistory)
  .delete("/", deleteMaintenanceHistory);

export default router;