"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RulesService = void 0;
const rules_repository_1 = require("./rules.repository");
const accounts_repository_1 = require("../accounts/accounts.repository");
const subscriptions_service_1 = require("../subscriptions/subscriptions.service");
const analytics_service_1 = require("../analytics/analytics.service");
class RulesService {
    rulesRepo;
    accountsRepo;
    subsService;
    analyticsService;
    constructor(rulesRepo = new rules_repository_1.RulesRepository(), accountsRepo = new accounts_repository_1.AccountsRepository(), subsService = new subscriptions_service_1.SubscriptionsService(), analyticsService = new analytics_service_1.AnalyticsService()) {
        this.rulesRepo = rulesRepo;
        this.accountsRepo = accountsRepo;
        this.subsService = subsService;
        this.analyticsService = analyticsService;
    }
    async createRule(userId, data) {
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
    async getAccountRules(userId, accountId) {
        const account = await this.accountsRepo.findById(accountId);
        if (!account || account.userId !== userId) {
            throw new Error('Unauthorized or account not found');
        }
        return await this.rulesRepo.findByAccountId(accountId);
    }
    async updateRule(userId, ruleId, data) {
        const rule = await this.rulesRepo.findById(ruleId);
        if (!rule || !rule.accountId)
            throw new Error('Rule not found or orphaned');
        const account = await this.accountsRepo.findById(rule.accountId);
        if (!account || account.userId !== userId) {
            throw new Error('Unauthorized');
        }
        return await this.rulesRepo.update(ruleId, data);
    }
    async deleteRule(userId, ruleId) {
        const rule = await this.rulesRepo.findById(ruleId);
        if (!rule || !rule.accountId)
            throw new Error('Rule not found or orphaned');
        const account = await this.accountsRepo.findById(rule.accountId);
        if (!account || account.userId !== userId) {
            throw new Error('Unauthorized');
        }
        await this.rulesRepo.hardDelete(ruleId);
    }
}
exports.RulesService = RulesService;
