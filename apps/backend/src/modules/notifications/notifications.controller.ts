import { Request, Response } from 'express';
import { NotificationsRepository } from './notifications.repository';

export class NotificationsController {
  private repo = new NotificationsRepository();

  getMyNotifications = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Unauthorized');
      const notifications = await this.repo.getByUserId(userId);
      res.status(200).json(notifications);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  markAsRead = async (req: Request, res: Response) => {
    try {
      await this.repo.markAsRead(req.params.id);
      res.status(200).json({ message: 'Marked as read' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };
}
