import { Router } from 'express';
import  authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import productRoutes from './product.routes.js';
import customerRoutes from './customer.routes.js';
import supplierRoutes from './supplier.routes.js';
import inventoryEntryRoutes from './inventoryEntry.routes.js';
import inventoryExitRoutes from './inventoryExit.routes.js';
import inventoryRoutes from './inventory.routes.js';

const router: Router = Router();

/* Test route */
router.get('/', (_req, res) => {
  res.send('Hello World');
});

/* Here are the routes */
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/product', productRoutes);
router.use('/customer', customerRoutes);
router.use('/supplier', supplierRoutes);
router.use('/inventory-entry', inventoryEntryRoutes);
router.use('/inventory-exit', inventoryExitRoutes);
router.use('/inventory', inventoryRoutes);

export default router;