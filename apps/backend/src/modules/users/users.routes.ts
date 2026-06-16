import { Router } from 'express';
import { UsersController } from './users.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

export const usersRouter = Router();
const usersController = new UsersController();

usersRouter.use(authMiddleware);

usersRouter.get('/me', usersController.getProfile);
usersRouter.put('/me', usersController.updateProfile);
