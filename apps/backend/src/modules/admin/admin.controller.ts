import { Request, Response } from 'express';
import { AdminRepository } from './admin.repository';

export class AdminController {
  private adminRepo = new AdminRepository();

  getAuditLogs = async (req: Request, res: Response) => {
    try {
      const logs = await this.adminRepo.getAuditLogs();
      res.status(200).json(logs);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  getWebhookEvents = async (req: Request, res: Response) => {
    try {
      const events = await this.adminRepo.getWebhookEvents();
      res.status(200).json(events);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };
}
