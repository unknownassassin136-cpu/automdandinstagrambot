import { Router } from 'express';
import { AutomationsController } from './automations.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

export const automationsRouter = Router();
const controller = new AutomationsController();

automationsRouter.use(authMiddleware);

// Rules
automationsRouter.post('/rules', controller.createRule);
automationsRouter.get('/rules', controller.getRules);
automationsRouter.put('/rules/:ruleId', controller.updateRule);
automationsRouter.delete('/rules/:ruleId', controller.deleteRule);

// Templates
automationsRouter.post('/templates', controller.createTemplate);
automationsRouter.get('/templates', controller.getTemplates);
automationsRouter.put('/templates/:templateId', controller.updateTemplate);
automationsRouter.delete('/templates/:templateId', controller.deleteTemplate);
