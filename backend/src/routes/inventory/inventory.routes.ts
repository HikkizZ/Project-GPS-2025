import { Router } from 'express';
import { verifyRole } from "../../middlewares/authorization.middleware.js";

import {
    getAllInventory
} from '../../controllers/inventory/inventory.controller.js';

import { authenticateJWT } from '../../middlewares/authentication.middleware.js';

const router = Router();

router.use(verifyRole(["Administrador", "SuperAdministrador", "Ventas", "Gerencia", "Finanzas"]));

router.use(authenticateJWT);

router.get('/', getAllInventory);

export default router;