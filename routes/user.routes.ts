import { Router } from 'express';
import { UserController } from '../controllers/users/users.controller';

const userRoutes = Router();

userRoutes.get('/', UserController.getUserById);

export default userRoutes;