import { Router } from 'express';
import { SubscriptionsController } from './subscriptions.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

export const subscriptionsRouter = Router();
const controller = new SubscriptionsController();

subscriptionsRouter.use(authMiddleware);

subscriptionsRouter.get('/status', controller.getBillingStatus);
subscriptionsRouter.post('/mock-upgrade', controller.mockUpgrade);
