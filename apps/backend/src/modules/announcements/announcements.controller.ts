import { Request, Response } from 'express';
import { AnnouncementsRepository } from './announcements.repository';

export class AnnouncementsController {
  private repo = new AnnouncementsRepository();

  getActive = async (req: Request, res: Response) => {
    try {
      const active = await this.repo.getActiveAnnouncements();
      res.status(200).json(active);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  getAll = async (req: Request, res: Response) => {
    try {
      const all = await this.repo.getAll();
      res.status(200).json(all);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const announcement = await this.repo.create(req.body);
      res.status(201).json(announcement);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };
}
