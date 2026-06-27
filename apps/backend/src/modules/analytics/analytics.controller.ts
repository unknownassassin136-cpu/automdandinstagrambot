import { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service';

export class AnalyticsController {
  private analyticsService = new AnalyticsService();

  getDashboardStats = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Unauthorized');
      const stats = await this.analyticsService.getDashboardStats(userId);
      res.status(200).json(stats);
    } catch (err: any) {
      console.error('[AnalyticsController] getDashboardStats Error:', err);
      res.status(400).json({ error: err.message });
    }
  };

  getRecentLogs = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Unauthorized');
      const limit = Number(req.query.limit) || 10;
      const logs = await this.analyticsService.getRecentLogs(userId, limit);
      res.status(200).json(logs);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  getAiStats = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Unauthorized');
      const stats = await this.analyticsService.getAiStats(userId);
      res.status(200).json(stats);
    } catch (err: any) {
      console.error('[AnalyticsController] getAiStats Error:', err);
      res.status(400).json({ error: err.message });
    }
  };
}
