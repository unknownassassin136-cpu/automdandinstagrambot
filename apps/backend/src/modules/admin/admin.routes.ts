import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { roleMiddleware } from '../../middleware/role.middleware';

export const adminRouter = Router();
const controller = new AdminController();

adminRouter.use(authMiddleware);
adminRouter.use(roleMiddleware('admin'));

adminRouter.get('/audit-logs', controller.getAuditLogs);
adminRouter.get('/webhooks', controller.getWebhookEvents);
