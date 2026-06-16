import { Router } from 'express';
import { TicketsController } from './tickets.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { roleMiddleware } from '../../middleware/role.middleware';

export const ticketsRouter = Router();
const controller = new TicketsController();

ticketsRouter.use(authMiddleware);

// User
ticketsRouter.get('/me', controller.getMyTickets);
ticketsRouter.post('/', controller.createTicket);

// Admin
ticketsRouter.get('/', roleMiddleware('admin'), controller.getAllTickets);
ticketsRouter.patch('/:id/status', roleMiddleware('admin'), controller.updateStatus);
