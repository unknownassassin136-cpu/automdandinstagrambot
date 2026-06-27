import { Request, Response } from 'express';
import { SubscriptionsService } from './subscriptions.service';

export class SubscriptionsController {
  private subsService = new SubscriptionsService();

  getBillingStatus = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Unauthorized');
      
      const status = await this.subsService.getBillingStatus(userId);
      res.status(200).json(status);
    } catch (err: any) {
      console.error('[SubscriptionsController] getBillingStatus Error:', err);
      res.status(400).json({ error: err.message });
    }
  };

  mockUpgrade = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { planName } = req.body;
      if (!userId) throw new Error('Unauthorized');
      if (!['free', 'plus', 'pro', 'ai_pro'].includes(planName)) throw new Error('Invalid plan name');

      await this.subsService.handleSubscriptionUpdate(userId, planName);
      const status = await this.subsService.getBillingStatus(userId);
      res.status(200).json(status);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };
}
