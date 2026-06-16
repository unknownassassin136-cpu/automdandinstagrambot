import { Request, Response } from 'express';
import { TicketsRepository } from './tickets.repository';

export class TicketsController {
  private repo = new TicketsRepository();

  getMyTickets = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Unauthorized');
      const tickets = await this.repo.getByUserId(userId);
      res.status(200).json(tickets);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  getAllTickets = async (req: Request, res: Response) => {
    try {
      const tickets = await this.repo.getAll();
      res.status(200).json(tickets);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  createTicket = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Unauthorized');
      const ticket = await this.repo.create({ ...req.body, userId });
      res.status(201).json(ticket);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  updateStatus = async (req: Request, res: Response) => {
    try {
      const ticket = await this.repo.updateStatus(req.params.id, req.body.status);
      res.status(200).json(ticket);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };
}
