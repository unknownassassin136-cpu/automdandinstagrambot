import { Router } from 'express';
import { AnnouncementsController } from './announcements.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { roleMiddleware } from '../../middleware/role.middleware';

export const announcementsRouter = Router();
const controller = new AnnouncementsController();

announcementsRouter.use(authMiddleware);

// Public (to authenticated users)
announcementsRouter.get('/active', controller.getActive);

// Admin only
announcementsRouter.get('/', roleMiddleware('admin'), controller.getAll);
announcementsRouter.post('/', roleMiddleware('admin'), controller.create);
