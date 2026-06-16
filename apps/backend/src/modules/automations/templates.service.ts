import { TemplatesRepository } from './templates.repository';
import { AccountsRepository } from '../accounts/accounts.repository';

export class TemplatesService {
  constructor(
    private templatesRepo: TemplatesRepository = new TemplatesRepository(),
    private accountsRepo: AccountsRepository = new AccountsRepository()
  ) {}

  async createTemplate(userId: string, data: any) {
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

  async getAccountTemplates(userId: string, accountId: string) {
    const account = await this.accountsRepo.findById(accountId);
    if (!account || account.userId !== userId) {
      throw new Error('Unauthorized or account not found');
    }

    return await this.templatesRepo.findByAccountId(accountId);
  }

  async updateTemplate(userId: string, templateId: string, data: any) {
    const template = await this.templatesRepo.findById(templateId);
    if (!template || !template.accountId) throw new Error('Template not found or orphaned');

    const account = await this.accountsRepo.findById(template.accountId);
    if (!account || account.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return await this.templatesRepo.update(templateId, data);
  }

  async deleteTemplate(userId: string, templateId: string) {
    const template = await this.templatesRepo.findById(templateId);
    if (!template || !template.accountId) throw new Error('Template not found or orphaned');

    const account = await this.accountsRepo.findById(template.accountId);
    if (!account || account.userId !== userId) {
      throw new Error('Unauthorized');
    }

    await this.templatesRepo.softDelete(templateId);
  }
}
