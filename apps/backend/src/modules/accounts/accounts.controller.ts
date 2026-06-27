import { Request, Response } from 'express';
import { AccountsService } from './accounts.service';
import { z } from 'zod';

const connectAccountSchema = z.object({
  code: z.string().min(1, 'OAuth authorization code is required'),
});

export class AccountsController {
  private accountsService = new AccountsService();

  connect = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) throw new Error('Unauthorized');

      const data = connectAccountSchema.parse(req.body);
      const account = await this.accountsService.connectAccount(userId, data.code);
      res.status(201).json(account);
    } catch (err: any) {
      if (err.name === 'ZodError') {
        res.status(400).json({ error: err.errors });
      } else {
        res.status(400).json({ error: err.message });
      }
    }
  };

  list = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) throw new Error('Unauthorized');

      const accounts = await this.accountsService.getConnectedAccounts(userId);
      res.status(200).json(accounts);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  disconnect = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) throw new Error('Unauthorized');

      const accountId = req.params.accountId;
      await this.accountsService.disconnectAccount(userId, accountId);
      res.status(200).json({ message: 'Account disconnected successfully' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  getMedia = async (req: Request, res: Response) => {
    try {
      console.log(`[AccountsController] getMedia called for account ${req.params.accountId}`);
      const userId = (req as any).user?.userId;
      if (!userId) throw new Error('Unauthorized');

      const accountId = req.params.accountId;
      const media = await this.accountsService.getAccountMedia(userId, accountId);
      res.status(200).json(media);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  toggleAiDm = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) throw new Error('Unauthorized');

      const accountId = req.params.accountId;
      const { enabled } = req.body;
      if (typeof enabled !== 'boolean') throw new Error('enabled must be a boolean');

      const account = await this.accountsService.toggleAiDm(userId, accountId, enabled);
      res.status(200).json(account);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  updateBusinessContext = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) throw new Error('Unauthorized');

      const accountId = req.params.accountId;
      const { businessContext } = req.body;
      if (typeof businessContext !== 'string') throw new Error('businessContext must be a string');

      const account = await this.accountsService.updateBusinessContext(userId, accountId, businessContext);
      res.status(200).json(account);
    } catch (err: any) {
      console.error('[AccountsController] Failed to update business context:', err);
      res.status(400).json({ error: err.message });
    }
  };
}
