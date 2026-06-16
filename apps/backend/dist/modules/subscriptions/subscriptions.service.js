"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const subscriptions_repository_1 = require("./subscriptions.repository");
// Dummy plan mapping for MVP
const PLANS = {
    free: { limit: 100, accounts: 1 },
    pro: { limit: 10000, accounts: 3 },
    enterprise: { limit: -1, accounts: 10 },
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
                monthlyLimit: PLANS['free'].limit,
                maxAccounts: PLANS['free'].accounts,
            });
        }
        return sub;
    }
    // Mock method for handling payment webhook
    async handleSubscriptionUpdate(userId, planName, expiresAt) {
        const plan = PLANS[planName] || PLANS['free'];
        return await this.subsRepo.createOrUpdate(userId, {
            planName,
            status: 'active',
            monthlyLimit: plan.limit,
            maxAccounts: plan.accounts,
            expiresAt: expiresAt || undefined,
        });
    }
}
exports.SubscriptionsService = SubscriptionsService;
