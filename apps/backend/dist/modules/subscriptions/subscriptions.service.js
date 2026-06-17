"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = exports.SUBSCRIPTION_PLANS = void 0;
const subscriptions_repository_1 = require("./subscriptions.repository");
const db_1 = require("../../database/db");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
// Subscription Tiers Configuration
exports.SUBSCRIPTION_PLANS = {
    free: { limit: 10, maxAutomations: 3, name: 'Free Plan' },
    plus: { limit: 20, maxAutomations: 5, name: 'Plus Plan' },
    pro: { limit: -1, maxAutomations: -1, name: 'Pro Plan' }, // -1 = Unlimited
};
class SubscriptionsService {
    subsRepo;
    constructor(subsRepo = new subscriptions_repository_1.SubscriptionsRepository()) {
        this.subsRepo = subsRepo;
    }
    async getSubscription(userId) {
        const sub = await this.subsRepo.getByUserId(userId);
        if (!sub) {
            // Auto-assign free plan if none exists
            return await this.subsRepo.createOrUpdate(userId, {
                planName: 'free',
                status: 'active',
                monthlyLimit: exports.SUBSCRIPTION_PLANS['free'].limit,
                maxAccounts: 1, // keeping this column but relying on SUBSCRIPTION_PLANS for automations
            });
        }
        return sub;
    }
    // Mock method for handling payment webhook or frontend testing upgrade
    async handleSubscriptionUpdate(userId, planName, expiresAt) {
        const plan = exports.SUBSCRIPTION_PLANS[planName] || exports.SUBSCRIPTION_PLANS['free'];
        return await this.subsRepo.createOrUpdate(userId, {
            planName,
            status: 'active',
            monthlyLimit: plan.limit,
            maxAccounts: 1, // legacy column
            expiresAt: expiresAt || undefined,
        });
    }
    async getBillingStatus(userId) {
        const sub = await this.getSubscription(userId);
        // Get usage tracking for the current month
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        let usage = await db_1.db.select().from(schema_1.usageTracking)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.usageTracking.userId, userId), (0, drizzle_orm_1.eq)(schema_1.usageTracking.month, currentMonth)))
            .limit(1)
            .then(res => res[0]);
        if (!usage) {
            usage = { id: '', userId, month: currentMonth, replyCount: 0, dmCount: 0 };
        }
        const planConfig = exports.SUBSCRIPTION_PLANS[sub.planName] || exports.SUBSCRIPTION_PLANS['free'];
        return {
            planName: planConfig.name,
            planId: sub.planName,
            monthlyLimit: planConfig.limit,
            maxAutomations: planConfig.maxAutomations,
            currentReplies: usage.replyCount,
            currentDms: usage.dmCount,
            status: sub.status,
            expiresAt: sub.expiresAt
        };
    }
}
exports.SubscriptionsService = SubscriptionsService;
