import { Router } from 'express';

import {
  getSpareParts,
  getSparePart,
  createSparePart,
  updateSparePart,
  deleteSparePart
} from '../../controllers/MachineryMaintenance/SparePart.controller.js';

import { authenticateJWT } from '../../middlewares/authentication.middleware.js';

const router: Router = Router();

router.use(authenticateJWT);

router.use(verifyRole(["Mecánico", "Administrador", "Mantenciones de Maquinaria", "SuperAdministrador"]));

router
  .get("/all", getSpareParts)
  .get("/", getSparePart)
  .post("/", createSparePart)
  .put("/", updateSparePart)
  .delete("/", deleteSparePart);

export default router;

