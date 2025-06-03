import { Router } from 'express';

import {
    createInventoryExit,
    getAllInventoryExits,
    getInventoryExitById,
    deleteInventoryExit
} from '../controllers/inventory/inventoryExit.controller.js';

import { authenticateJWT } from '../middlewares/authentication.middleware.js';

const router = Router();

router.use(authenticateJWT);

router
    .post('/', createInventoryExit)
    .get('/all', getAllInventoryExits)
    .get('/', getInventoryExitById)
    .delete('/', deleteInventoryExit);

export default router;