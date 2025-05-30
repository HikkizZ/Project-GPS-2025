import { Router } from 'express';
import  authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import productRoutes from './product.routes.js';
import customerRoutes from './customer.routes.js';
import supplierRoutes from './supplier.routes.js';
import fichaEmpresaRoutes from './recursosHumanos/fichaEmpresa.routes.js';
import licenciaPermisoRoutes from './recursosHumanos/licenciaPermiso.routes.js';
import trabajadorRoutes from './recursosHumanos/trabajador.routes.js';
import historialLaboralRoutes from './recursosHumanos/historialLaboral.routes.js';
import cambiosLaboralesRoutes from './recursosHumanos/cambiosLaborales.routes.js';
import capacitacionRoutes from './recursosHumanos/capacitacion.routes.js';
import filesRoutes from './files.routes.js';

const router: Router = Router();

/* Test route */
router.get('/', (_req, res) => {
    res.status(200).json({
        msg: "API Working",
        version: "1.0.0",
        timestamp: new Date().toISOString()
    });
});

/* Auth routes */
router.use('/auth', authRoutes);

/* User routes */
router.use('/user', userRoutes);

/* Product routes */
router.use('/product', productRoutes);

/* Customer routes */
router.use('/customer', customerRoutes);

/* Supplier routes */
router.use('/supplier', supplierRoutes);

/* Recursos Humanos routes */
router.use('/ficha-empresa', fichaEmpresaRoutes);
router.use('/licencia-permiso', licenciaPermisoRoutes);
router.use('/trabajador', trabajadorRoutes);
router.use('/historial-laboral', historialLaboralRoutes);
router.use('/cambios-laborales', cambiosLaboralesRoutes);
router.use('/capacitacion', capacitacionRoutes);

/* Files routes */
router.use('/files', filesRoutes);

export default router;