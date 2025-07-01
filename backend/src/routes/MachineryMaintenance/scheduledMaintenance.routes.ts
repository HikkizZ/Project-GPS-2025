import { Router } from 'express';
import {
  getScheduledMaintenances,
  getScheduledMaintenance,
  createScheduledMaintenance,
  updateScheduledMaintenance,
  deleteScheduledMaintenance
} from '../../controllers/MachineryMaintenance/scheduledMaintenance.controller.js';

import { authenticateJWT } from '../../middlewares/authentication.middleware.js';

const router: Router = Router();

router.use(authenticateJWT);

router.use(verifyRole(["Mecánico", "Administrador", "Mantenciones de Maquinaria", "SuperAdministrador"]));

router
  .get("/all", getScheduledMaintenances)
  .get("/", getScheduledMaintenance)
  .post("/", createScheduledMaintenance)
  .put("/", updateScheduledMaintenance)
  .delete("/", deleteScheduledMaintenance);

export default router;
