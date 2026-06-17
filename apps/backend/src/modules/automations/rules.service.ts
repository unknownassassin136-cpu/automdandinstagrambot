import { RulesRepository } from './rules.repository';
import { AccountsRepository } from '../accounts/accounts.repository';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { AnalyticsService } from '../analytics/analytics.service';

export class RulesService {
  constructor(
    private rulesRepo: RulesRepository = new RulesRepository(),
    private accountsRepo: AccountsRepository = new AccountsRepository(),
    private subsService: SubscriptionsService = new SubscriptionsService(),
    private analyticsService: AnalyticsService = new AnalyticsService()
  ) {}

  async createRule(userId: string, data: any) {
    // Ensure the account belongs to the user
    const account = await this.accountsRepo.findById(data.accountId);
    if (!account || account.userId !== userId) {
      throw new Error('Unauthorized or account not found');
    }

    // Check Subscription Limits
    const billingStatus = await this.subsService.getBillingStatus(userId);
    if (billingStatus.maxAutomations !== -1) {
      const stats = await this.analyticsService.getDashboardStats(userId);
      if (stats.totalAutomations >= billingStatus.maxAutomations) {
        throw new Error(`SUBSCRIPTION_LIMIT_REACHED: Your current plan only allows up to ${billingStatus.maxAutomations} automation rules.`);
      }
    }

    return await this.rulesRepo.create({
      accountId: data.accountId,
      targetMediaId: data.targetMediaId,
      isDefaultRule: data.isDefaultRule,
      triggerType: data.triggerType || 'exact',
      triggerKeyword: data.triggerKeyword,
      replyCommentText: data.replyCommentText,
      dmTemplateText: data.dmTemplateText,
    });
  }

  async getAccountRules(userId: string, accountId: string) {
    const account = await this.accountsRepo.findById(accountId);
    if (!account || account.userId !== userId) {
      throw new Error('Unauthorized or account not found');
    }

    return await this.rulesRepo.findByAccountId(accountId);
  }

  async updateRule(userId: string, ruleId: string, data: any) {
    const rule = await this.rulesRepo.findById(ruleId);
    if (!rule || !rule.accountId) throw new Error('Rule not found or orphaned');

    const account = await this.accountsRepo.findById(rule.accountId);
    if (!account || account.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return await this.rulesRepo.update(ruleId, data);
  }

  async deleteRule(userId: string, ruleId: string) {
    const rule = await this.rulesRepo.findById(ruleId);
    if (!rule || !rule.accountId) throw new Error('Rule not found or orphaned');

    const account = await this.accountsRepo.findById(rule.accountId);
    if (!account || account.userId !== userId) {
      throw new Error('Unauthorized');
    }

    await this.rulesRepo.hardDelete(ruleId);
  }
}
