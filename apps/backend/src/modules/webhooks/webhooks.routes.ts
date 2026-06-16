import { Router } from 'express';
import { WebhooksController } from './webhooks.controller';

export const webhooksRouter = Router();
const controller = new WebhooksController();

webhooksRouter.get('/instagram', controller.verifyChallenge);
webhooksRouter.post('/instagram', controller.handleWebhook);
