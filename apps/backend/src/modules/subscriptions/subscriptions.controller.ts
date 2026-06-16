import { Request, Response } from 'express';
import { SubscriptionsService } from './subscriptions.service';

export class SubscriptionsController {
  private subsService = new SubscriptionsService();

  getSubscription = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Unauthorized');
      
      const sub = await this.subsService.getSubscription(userId);
      res.status(200).json(sub);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };
}
