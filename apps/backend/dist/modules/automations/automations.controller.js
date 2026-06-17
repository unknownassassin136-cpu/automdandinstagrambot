"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationsController = void 0;
const rules_service_1 = require("./rules.service");
const templates_service_1 = require("./templates.service");
class AutomationsController {
    rulesService = new rules_service_1.RulesService();
    templatesService = new templates_service_1.TemplatesService();
    // Rules
    createRule = async (req, res) => {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new Error('Unauthorized');
            const rule = await this.rulesService.createRule(userId, req.body);
            res.status(201).json(rule);
        }
        catch (err) {
            console.error('[createRule Error]:', err);
            res.status(400).json({ error: err.message });
        }
    };
    getRules = async (req, res) => {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new Error('Unauthorized');
            const accountId = req.query.accountId;
            if (!accountId)
                throw new Error('accountId query parameter is required');
            const rules = await this.rulesService.getAccountRules(userId, accountId);
            res.status(200).json(rules);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    updateRule = async (req, res) => {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new Error('Unauthorized');
            const rule = await this.rulesService.updateRule(userId, req.params.ruleId, req.body);
            res.status(200).json(rule);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    deleteRule = async (req, res) => {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new Error('Unauthorized');
            await this.rulesService.deleteRule(userId, req.params.ruleId);
            res.status(200).json({ message: 'Rule deleted' });
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    // Templates
    createTemplate = async (req, res) => {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new Error('Unauthorized');
            const template = await this.templatesService.createTemplate(userId, req.body);
            res.status(201).json(template);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    getTemplates = async (req, res) => {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new Error('Unauthorized');
            const accountId = req.query.accountId;
            if (!accountId)
                throw new Error('accountId query parameter is required');
            const templates = await this.templatesService.getAccountTemplates(userId, accountId);
            res.status(200).json(templates);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    updateTemplate = async (req, res) => {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new Error('Unauthorized');
            const template = await this.templatesService.updateTemplate(userId, req.params.templateId, req.body);
            res.status(200).json(template);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
    deleteTemplate = async (req, res) => {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new Error('Unauthorized');
            await this.templatesService.deleteTemplate(userId, req.params.templateId);
            res.status(200).json({ message: 'Template deleted' });
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    };
}
exports.AutomationsController = AutomationsController;
