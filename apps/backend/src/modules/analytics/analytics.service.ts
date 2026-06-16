import { db } from '../../database/db';
import { usageTracking, automationLogs, connectedAccounts } from '../../database/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export class AnalyticsService {
  async getDashboardStats(userId: string) {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    // 1. Get Usage Tracking
    const [usage] = await db.select()
      .from(usageTracking)
      .where(
        and(
          eq(usageTracking.userId, userId),
          eq(usageTracking.month, currentMonth)
        )
      );

    // 2. Get connected accounts count
    const [{ count }] = await db.select({ count: sql<number>`count(*)` })
      .from(connectedAccounts)
      .where(and(eq(connectedAccounts.userId, userId), sql`deleted_at IS NULL`));

    return {
      repliesSent: usage?.replyCount || 0,
      dmsSent: usage?.dmCount || 0,
      totalAutomations: (usage?.replyCount || 0) + (usage?.dmCount || 0),
      connectedAccounts: Number(count) || 0,
    };
  }

  async getRecentLogs(userId: string, limit = 10) {
    // Join automation_logs with connected_accounts to ensure user owns the account
    return db.select({
      id: automationLogs.id,
      actionType: automationLogs.actionType,
      status: automationLogs.status,
      errorMessage: automationLogs.errorMessage,
      createdAt: automationLogs.createdAt,
      accountName: connectedAccounts.pageName,
    })
    .from(automationLogs)
    .innerJoin(connectedAccounts, eq(automationLogs.accountId, connectedAccounts.id))
    .where(eq(connectedAccounts.userId, userId))
    .orderBy(desc(automationLogs.createdAt))
    .limit(limit);
  }
}
