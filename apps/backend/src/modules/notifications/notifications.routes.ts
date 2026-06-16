import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

export const notificationsRouter = Router();
const controller = new NotificationsController();

notificationsRouter.use(authMiddleware);

notificationsRouter.get('/me', controller.getMyNotifications);
notificationsRouter.patch('/:id/read', controller.markAsRead);
