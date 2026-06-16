import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

export const analyticsRouter = Router();
const controller = new AnalyticsController();

analyticsRouter.use(authMiddleware);

analyticsRouter.get('/dashboard', controller.getDashboardStats);
analyticsRouter.get('/logs', controller.getRecentLogs);
