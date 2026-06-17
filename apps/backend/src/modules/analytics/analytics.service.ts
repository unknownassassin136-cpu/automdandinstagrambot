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
    const [{ count: accountsCount }] = await db.select({ count: sql<number>`count(*)` })
      .from(connectedAccounts)
      .where(and(eq(connectedAccounts.userId, userId), sql`deleted_at IS NULL`));

    // 3. Get total active automation rules across all connected accounts for this user
    const [{ count: rulesCount }] = await db.select({ count: sql<number>`count(*)` })
      .from(automationRules)
      .innerJoin(connectedAccounts, eq(automationRules.accountId, connectedAccounts.id))
      .where(and(eq(connectedAccounts.userId, userId), eq(automationRules.isActive, true), sql`automation_rules.deleted_at IS NULL`));

    return {
      repliesSent: usage?.replyCount || 0,
      dmsSent: usage?.dmCount || 0,
      totalAutomations: Number(rulesCount) || 0,
      connectedAccounts: Number(accountsCount) || 0,
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

  async incrementUsage(userId: string, type: 'reply' | 'dm') {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    // Check if record exists
    const [existing] = await db.select()
      .from(usageTracking)
      .where(and(eq(usageTracking.userId, userId), eq(usageTracking.month, currentMonth)));

    if (existing) {
      await db.update(usageTracking)
        .set({
          replyCount: type === 'reply' ? existing.replyCount! + 1 : existing.replyCount,
          dmCount: type === 'dm' ? existing.dmCount! + 1 : existing.dmCount,
        })
        .where(eq(usageTracking.id, existing.id));
    } else {
      await db.insert(usageTracking).values({
        userId,
        month: currentMonth,
        replyCount: type === 'reply' ? 1 : 0,
        dmCount: type === 'dm' ? 1 : 0,
      });
    }
  }

  async logAction(accountId: string, ruleId: string | null, actionType: string, status: string, errorMessage?: string) {
    await db.insert(automationLogs).values({
      accountId,
      ruleId,
      actionType,
      status,
      errorMessage,
    });
  }
}
