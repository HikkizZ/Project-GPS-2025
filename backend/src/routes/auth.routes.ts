import { Router } from 'express';
import { login, logout } from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middlewares/authentication.middleware.js';
import { verifyRole } from '../middlewares/authorization.middleware.js';

const router: Router = Router();

// Ruta pública para login
router.post('/login', login);

// Ruta protegida para logout
router.post('/logout',
    authenticateJWT,
    logout
);

export default router;
