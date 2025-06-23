import { Router } from 'express';

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
    .post('/', createInventoryEntry)
    .get('/all', getAllInventoryEntries)
    .get('/', getInventoryEntryById)
    .delete('/', deleteInventoryEntry);

export default router;