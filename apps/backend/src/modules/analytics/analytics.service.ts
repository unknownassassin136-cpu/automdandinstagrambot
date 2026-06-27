import { db } from '../../database/db';
import { usageTracking, automationLogs, connectedAccounts, automationRules } from '../../database/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export class AnalyticsService {
  async getDashboardStats(userId: string) {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    // 1. Get Usage Tracking (Sum of all rules owned by user)
    const [usageResult] = await db.select({
      totalReplies: sql<number>`sum(${usageTracking.replyCount})`,
      totalDms: sql<number>`sum(${usageTracking.dmCount})`
    })
    .from(usageTracking)
    .innerJoin(automationRules, eq(usageTracking.ruleId, automationRules.id))
    .innerJoin(connectedAccounts, eq(automationRules.accountId, connectedAccounts.id))
    .where(
      and(
        eq(connectedAccounts.userId, userId),
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
      repliesSent: Number(usageResult?.totalReplies) || 0,
      dmsSent: Number(usageResult?.totalDms) || 0,
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
      accountName: connectedAccounts.instagramUsername,
    })
    .from(automationLogs)
    .innerJoin(connectedAccounts, eq(automationLogs.accountId, connectedAccounts.id))
    .where(eq(connectedAccounts.userId, userId))
    .orderBy(desc(automationLogs.createdAt))
    .limit(limit);
  }

  async getAiStats(userId: string) {
    const logs = await db.select({
      status: automationLogs.status,
      count: sql<number>`count(*)`
    })
    .from(automationLogs)
    .innerJoin(connectedAccounts, eq(automationLogs.accountId, connectedAccounts.id))
    .where(
      and(
        eq(connectedAccounts.userId, userId),
        eq(automationLogs.actionType, 'ai_dm')
      )
    )
    .groupBy(automationLogs.status);

    let sent = 0;
    let blocked = 0;
    let failed = 0;

    for (const log of logs) {
      if (log.status === 'success') sent += Number(log.count);
      else if (log.status === 'blocked') blocked += Number(log.count);
      else failed += Number(log.count);
    }

    return { sent, blocked, failed, total: sent + blocked + failed };
  }

  async incrementUsage(ruleId: string, type: 'reply' | 'dm') {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    // Check if record exists
    const [existing] = await db.select()
      .from(usageTracking)
      .where(and(eq(usageTracking.ruleId, ruleId), eq(usageTracking.month, currentMonth)));

    if (existing) {
      await db.update(usageTracking)
        .set({
          replyCount: type === 'reply' ? existing.replyCount! + 1 : existing.replyCount,
          dmCount: type === 'dm' ? existing.dmCount! + 1 : existing.dmCount,
        })
        .where(eq(usageTracking.id, existing.id));
    } else {
      await db.insert(usageTracking).values({
        ruleId,
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
