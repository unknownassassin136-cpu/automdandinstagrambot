import { Request, Response } from 'express';
import { RulesService } from './rules.service';
import { TemplatesService } from './templates.service';

export class AutomationsController {
  private rulesService = new RulesService();
  private templatesService = new TemplatesService();

  // Rules
  createRule = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Unauthorized');
      const rule = await this.rulesService.createRule(userId, req.body);
      res.status(201).json(rule);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  getRules = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Unauthorized');
      const accountId = req.query.accountId as string;
      if (!accountId) throw new Error('accountId query parameter is required');
      const rules = await this.rulesService.getAccountRules(userId, accountId);
      res.status(200).json(rules);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  updateRule = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Unauthorized');
      const rule = await this.rulesService.updateRule(userId, req.params.ruleId, req.body);
      res.status(200).json(rule);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  deleteRule = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Unauthorized');
      await this.rulesService.deleteRule(userId, req.params.ruleId);
      res.status(200).json({ message: 'Rule deleted' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  // Templates
  createTemplate = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Unauthorized');
      const template = await this.templatesService.createTemplate(userId, req.body);
      res.status(201).json(template);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  getTemplates = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Unauthorized');
      const accountId = req.query.accountId as string;
      if (!accountId) throw new Error('accountId query parameter is required');
      const templates = await this.templatesService.getAccountTemplates(userId, accountId);
      res.status(200).json(templates);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  updateTemplate = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Unauthorized');
      const template = await this.templatesService.updateTemplate(userId, req.params.templateId, req.body);
      res.status(200).json(template);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  deleteTemplate = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Unauthorized');
      await this.templatesService.deleteTemplate(userId, req.params.templateId);
      res.status(200).json({ message: 'Template deleted' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };
}
