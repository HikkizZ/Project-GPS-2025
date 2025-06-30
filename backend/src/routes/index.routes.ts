import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import productRoutes from './inventory/product.routes.js';
import customerRoutes from './stakeholders/customer.routes.js';
import supplierRoutes from './stakeholders/supplier.routes.js';
import fichaEmpresaRoutes from './recursosHumanos/fichaEmpresa.routes.js';
import licenciaPermisoRoutes from './recursosHumanos/licenciaPermiso.routes.js';
import trabajadorRoutes from './recursosHumanos/trabajador.routes.js';
import historialLaboralRoutes from './recursosHumanos/historialLaboral.routes.js';
import filesRoutes from './files.routes.js';
import { authenticateJWT } from '../middlewares/authentication.middleware.js';
import inventoryExitRoutes from './inventory/inventoryExit.routes.js';
import inventoryRoutes from './inventory/inventory.routes.js';
import inventoryEntryRoutes from './inventory/inventoryEntry.routes.js';
import bonosRoutes from './recursosHumanos/remuneraciones/bonos.routes.js';

const router: Router = Router();

/* Test route */
router.get('/', (_req, res) => {
    res.status(200).json({
        msg: "API Working",
        version: "1.0.0",
        timestamp: new Date().toISOString()
    });
});

// Rutas de autenticación (públicas)
router.use('/auth', authRoutes);

// Middleware de autenticación para todas las rutas protegidas
router.use(authenticateJWT);

// Rutas protegidas
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/customers', customerRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/ficha-empresa', fichaEmpresaRoutes);
router.use('/licencia-permiso', licenciaPermisoRoutes);
router.use('/trabajadores', trabajadorRoutes);
router.use('/historial-laboral', historialLaboralRoutes);
router.use('/trabajador', trabajadorRoutes);
router.use('/files', filesRoutes);
router.use('/inventory-entry', inventoryEntryRoutes);
router.use('/inventory-exit', inventoryExitRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/bonos', bonosRoutes);

export default router;