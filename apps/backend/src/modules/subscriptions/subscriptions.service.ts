import { SubscriptionsRepository } from './subscriptions.repository';

// Dummy plan mapping for MVP
const PLANS: Record<string, any> = {
  free: { limit: 100, accounts: 1 },
  pro: { limit: 10000, accounts: 3 },
  enterprise: { limit: -1, accounts: 10 },
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
        monthlyLimit: PLANS['free'].limit,
        maxAccounts: PLANS['free'].accounts,
      });
    }
    return sub;
  }

  // Mock method for handling payment webhook
  async handleSubscriptionUpdate(userId: string, planName: string, expiresAt?: Date) {
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
