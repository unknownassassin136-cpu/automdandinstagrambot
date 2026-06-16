import { Router } from 'express';
import { AccountsController } from './accounts.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

export const accountsRouter = Router();
const accountsController = new AccountsController();

accountsRouter.use(authMiddleware);

accountsRouter.post('/connect', accountsController.connect);
accountsRouter.get('/', accountsController.list);
accountsRouter.get('/:accountId/media', accountsController.getMedia);
accountsRouter.delete('/:accountId', accountsController.disconnect);
