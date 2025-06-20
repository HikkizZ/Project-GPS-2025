import { Router } from 'express';

import {
    getAllInventory
} from '../controllers/inventory/inventory.controller.js';

import { authenticateJWT } from '../middlewares/authentication.middleware.js';

const router = Router();

router.use(authenticateJWT);

router.get('/', getAllInventory);

export default router;