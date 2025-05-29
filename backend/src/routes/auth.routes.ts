import { Router } from 'express';
import { login, register, logout } from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middlewares/authentication.middleware.js';
import { verifyRole } from '../middlewares/authorization.middleware.js';

const router: Router = Router();

// Ruta pública para login
router.post('/login', login);

// Ruta protegida para registro (solo admin y RRHH)
router.post('/register', 
    authenticateJWT,
    verifyRole(['Administrador', 'RecursosHumanos']),
    register
);

// Ruta para logout
router.post('/logout', logout);

export default router;
