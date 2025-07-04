import { Router } from 'express';
import AuthController from '../controllers/auth/auth.controller';

const authRoutes = Router();

// Rota pública para registrar usuário
authRoutes.post('/register', AuthController.register);

// Rota pública para login
authRoutes.post('/login', AuthController.login);

export default authRoutes;
