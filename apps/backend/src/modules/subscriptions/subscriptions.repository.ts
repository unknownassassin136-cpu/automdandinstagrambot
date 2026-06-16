import { db } from '../../database/db';
import { subscriptions } from '../../database/schema';
import { eq } from 'drizzle-orm';

export class SubscriptionsRepository {
  async getByUserId(userId: string) {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
    return sub;
  }

  async createOrUpdate(userId: string, data: Partial<{ planName: string; status: string; monthlyLimit: number; maxAccounts: number; expiresAt: Date }>) {
    const existing = await this.getByUserId(userId);
    if (existing) {
      const [updated] = await db.update(subscriptions)
        .set(data)
        .where(eq(subscriptions.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(subscriptions).values({
        userId,
        ...data,
      }).returning();
      return created;
    }
  }
}
