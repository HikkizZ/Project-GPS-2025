import {Router} from 'express';

import {

    createRefuelingRecord,
    getRefuelingRecords,
    getRefuelingRecord,
    updateRefuelingRecord,
    deleteRefuelingRecord

}

import { authenticateJWT } from "../../middlewares/authentication.middleware.js";
import { verifyRole } from "../../middlewares/authorization.middleware.js";

const router: Router = Router();

router.use(authenticateJWT);

router.use(verifyRole(["Mecánico", "Administrador", "Mantenciones de Maquinaria", "SuperAdministrador"]));

router
  .get("/all", getRefuelingRecords)
  .get("/", getRefuelingRecord)
  .post("/", createRefuelingRecord)
  .put("/", updateRefuelingRecord)
  .delete("/", deleteRefuelingRecord);

export default router;