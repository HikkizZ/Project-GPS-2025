import { Router } from 'express';
import  authRoutes from './auth.routes.js';

const router: Router = Router();

/* Test route */
router.get('/', (req, res) => {
  res.send('Hello World');
});

/* Here are the routes */
router.use('/auth', authRoutes);

export default router;