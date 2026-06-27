import { SubscriptionsRepository } from './subscriptions.repository';
import { db } from '../../database/db';
import { usageTracking } from '../../database/schema';
import { eq, and } from 'drizzle-orm';

// Subscription Tiers Configuration
export const SUBSCRIPTION_PLANS: Record<string, any> = {
  free: { limit: 10, maxAutomations: 3, aiAccess: false, aiDmLimit: 0, name: 'Free Plan' },
  plus: { limit: 20, maxAutomations: 5, aiAccess: false, aiDmLimit: 0, name: 'Plus Plan' },
  pro: { limit: -1, maxAutomations: -1, aiAccess: true, aiDmLimit: 100, name: 'Pro Plan' }, // 100 AI DMs/month
  ai: { limit: -1, maxAutomations: -1, aiAccess: true, aiDmLimit: -1, name: 'AI Plan' }, // Unlimited AI
};

export class SubscriptionsService {
  constructor(private subsRepo: SubscriptionsRepository = new SubscriptionsRepository()) {}

  async getSubscription(userId: string) {
    const sub = await this.subsRepo.getByUserId(userId);
    if (!sub) {
      // Auto-assign free plan if none exists
      return await this.subsRepo.createOrUpdate(userId, {
        planName: 'free',
        status: 'active',
        monthlyLimit: SUBSCRIPTION_PLANS['free'].limit,
        maxAccounts: 1, // keeping this column but relying on SUBSCRIPTION_PLANS for automations
      });
    }
    return sub;
  }

  // Mock method for handling payment webhook or frontend testing upgrade
  async handleSubscriptionUpdate(userId: string, planName: string, expiresAt?: Date) {
    const plan = SUBSCRIPTION_PLANS[planName] || SUBSCRIPTION_PLANS['free'];
    
    return await this.subsRepo.createOrUpdate(userId, {
      planName,
      status: 'active',
      monthlyLimit: plan.limit,
      maxAccounts: 1, // legacy column
      expiresAt: expiresAt || undefined,
    });
  }

  async getBillingStatus(userId: string) {
    const sub = await this.getSubscription(userId);
    
    // Get usage tracking for the current month by summing up all rules for this user
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    // We'll calculate total usage by querying all the user's rules and joining usageTracking
    // For simplicity, we can fetch all rules for the user, then sum their usage for this month.
    let totalReplies = 0;
    let totalDms = 0;

    const planConfig = SUBSCRIPTION_PLANS[sub.planName] || SUBSCRIPTION_PLANS['free'];

    return {
      planName: planConfig.name,
      planId: sub.planName,
      limitPerAutomation: planConfig.limit,
      maxAutomations: planConfig.maxAutomations,
      currentReplies: totalReplies, // We can aggregate this later if needed for dashboard
      currentDms: totalDms,
      status: sub.status,
      expiresAt: sub.expiresAt
    };
  }

  async getRuleUsage(ruleId: string) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    let usage = await db.select().from(usageTracking)
      .where(and(eq(usageTracking.ruleId, ruleId), eq(usageTracking.month, currentMonth)))
      .limit(1)
      .then(res => res[0]);

    if (!usage) {
      usage = { id: '', ruleId, month: currentMonth, replyCount: 0, dmCount: 0 } as any;
    }
    return usage;
  }

}
