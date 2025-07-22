import { Router } from 'express';
import { verifyRole } from "../../middlewares/authorization.middleware.js";

import {
    createInventoryEntry,
    getAllInventoryEntries,
    getInventoryEntryById,
    deleteInventoryEntry
} from '../../controllers/inventory/inventoryEntry.controller.js';

import { authenticateJWT } from '../../middlewares/authentication.middleware.js';

const router = Router();

router.use(authenticateJWT);

router
    .post('/', verifyRole(["Administrador", "SuperAdministrador", "Ventas", "Gerencia"]), createInventoryEntry)
    .get('/all', verifyRole(["Administrador", "SuperAdministrador", "Ventas", "Gerencia", "Finanzas"]), getAllInventoryEntries)
    .get('/:id', verifyRole(["Administrador", "SuperAdministrador", "Ventas", "Gerencia", "Finanzas"]),getInventoryEntryById)
    .delete('/:id', verifyRole(["Administrador", "SuperAdministrador", "Ventas", "Gerencia"]), deleteInventoryEntry);

export default router;