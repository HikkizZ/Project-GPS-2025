import { Router } from 'express';
import  authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import productRoutes from './product.routes.js';
import customerRoutes from './customer.routes.js';
import supplierRoutes from './supplier.routes.js';
import fichaEmpresaRoutes from './recursosHumanos/fichaEmpresa.routes.js';
import licenciaPermisoRoutes from './recursosHumanos/licenciaPermiso.routes.js';
import trabajadorRoutes from './recursosHumanos/trabajador.routes.js';

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
router.use('/ficha-empresa', fichaEmpresaRoutes);
router.use('/licencia-permiso', licenciaPermisoRoutes);
router.use('/trabajador', trabajadorRoutes);

export default router;