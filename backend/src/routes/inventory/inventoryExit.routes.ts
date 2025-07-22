import { Router } from 'express';
import { verifyRole } from "../../middlewares/authorization.middleware.js";

import {
    createInventoryExit,
    getAllInventoryExits,
    getInventoryExitById,
    deleteInventoryExit
} from '../../controllers/inventory/inventoryExit.controller.js';

import { authenticateJWT } from '../../middlewares/authentication.middleware.js';

const router = Router();

router.use(authenticateJWT);
router
    .post('/', verifyRole(["Administrador", "SuperAdministrador", "Ventas", "Gerencia"]), createInventoryExit)
    .get('/all', verifyRole(["Administrador", "SuperAdministrador", "Ventas", "Gerencia", "Finanzas"]), getAllInventoryExits)
    .get('/:id', verifyRole(["Administrador", "SuperAdministrador", "Ventas", "Gerencia", "Finanzas"]), getInventoryExitById)
    .delete('/:id', verifyRole(["Administrador", "SuperAdministrador", "Ventas", "Gerencia"]), deleteInventoryExit);

export default router;