import { Router } from 'express';
import  authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import maquinariaRoutes from './maquinaria/maquinaria.routes.js'

const router: Router = Router();

/* Test route */
router.get('/', (req, res) => {
  res.send('Hello World');
});

/* Here are the routes */
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/maquinaria', maquinariaRoutes);

export default router;