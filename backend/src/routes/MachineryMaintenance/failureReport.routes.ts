import { Router } from 'express';
import {
  createFailureReport,
  getFailureReports,
  getFailureReport
  updateFailureReport,
  deleteFailureReport
} from '../../controllers/MachineryMaintenance/failureReport.controller.js';

import { authenticateJWT } from "../../middlewares/authentication.middleware.js";
import { verifyRole } from "../../middlewares/authorization.middleware.js";

const router: Router = Router();

router.use(authenticateJWT);

router.use(verifyRole(["Mecánico", "Administrador", "Mantenciones de Maquinaria", "SuperAdministrador"]));

router
  .get("/all", getFailureReports)
  .get("/", getFailureReport)
  .post("/", createFailureReport)
  .put("/", updateFailureReport)
  .delete("/", deleteFailureReport);

export default router;
