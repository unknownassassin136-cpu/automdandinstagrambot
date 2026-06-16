"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplatesService = void 0;
const templates_repository_1 = require("./templates.repository");
const accounts_repository_1 = require("../accounts/accounts.repository");
class TemplatesService {
    templatesRepo;
    accountsRepo;
    constructor(templatesRepo = new templates_repository_1.TemplatesRepository(), accountsRepo = new accounts_repository_1.AccountsRepository()) {
        this.templatesRepo = templatesRepo;
        this.accountsRepo = accountsRepo;
    }
    async createTemplate(userId, data) {
        const account = await this.accountsRepo.findById(data.accountId);
        if (!account || account.userId !== userId) {
            throw new Error('Unauthorized or account not found');
        }
        return await this.templatesRepo.create({
            accountId: data.accountId,
            templateName: data.templateName,
            templateContent: data.templateContent,
            templateType: data.templateType,
        });
    }
    async getAccountTemplates(userId, accountId) {
        const account = await this.accountsRepo.findById(accountId);
        if (!account || account.userId !== userId) {
            throw new Error('Unauthorized or account not found');
        }
        return await this.templatesRepo.findByAccountId(accountId);
    }
    async updateTemplate(userId, templateId, data) {
        const template = await this.templatesRepo.findById(templateId);
        if (!template || !template.accountId)
            throw new Error('Template not found or orphaned');
        const account = await this.accountsRepo.findById(template.accountId);
        if (!account || account.userId !== userId) {
            throw new Error('Unauthorized');
        }
        return await this.templatesRepo.update(templateId, data);
    }
    async deleteTemplate(userId, templateId) {
        const template = await this.templatesRepo.findById(templateId);
        if (!template || !template.accountId)
            throw new Error('Template not found or orphaned');
        const account = await this.accountsRepo.findById(template.accountId);
        if (!account || account.userId !== userId) {
            throw new Error('Unauthorized');
        }
        await this.templatesRepo.softDelete(templateId);
    }
}
exports.TemplatesService = TemplatesService;
