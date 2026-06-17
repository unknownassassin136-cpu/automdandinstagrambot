"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const db_1 = require("../../database/db");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
class AnalyticsService {
    async getDashboardStats(userId) {
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        // 1. Get Usage Tracking
        const [usage] = await db_1.db.select()
            .from(schema_1.usageTracking)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.usageTracking.userId, userId), (0, drizzle_orm_1.eq)(schema_1.usageTracking.month, currentMonth)));
        // 2. Get connected accounts count
        const [{ count: accountsCount }] = await db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(schema_1.connectedAccounts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.connectedAccounts.userId, userId), (0, drizzle_orm_1.sql) `deleted_at IS NULL`));
        // 3. Get total active automation rules across all connected accounts for this user
        const [{ count: rulesCount }] = await db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(schema_1.automationRules)
            .innerJoin(schema_1.connectedAccounts, (0, drizzle_orm_1.eq)(schema_1.automationRules.accountId, schema_1.connectedAccounts.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.connectedAccounts.userId, userId), (0, drizzle_orm_1.eq)(schema_1.automationRules.isActive, true), (0, drizzle_orm_1.sql) `automation_rules.deleted_at IS NULL`));
        return {
            repliesSent: usage?.replyCount || 0,
            dmsSent: usage?.dmCount || 0,
            totalAutomations: Number(rulesCount) || 0,
            connectedAccounts: Number(accountsCount) || 0,
        };
    }
    async getRecentLogs(userId, limit = 10) {
        // Join automation_logs with connected_accounts to ensure user owns the account
        return db_1.db.select({
            id: schema_1.automationLogs.id,
            actionType: schema_1.automationLogs.actionType,
            status: schema_1.automationLogs.status,
            errorMessage: schema_1.automationLogs.errorMessage,
            createdAt: schema_1.automationLogs.createdAt,
            accountName: schema_1.connectedAccounts.pageName,
        })
            .from(schema_1.automationLogs)
            .innerJoin(schema_1.connectedAccounts, (0, drizzle_orm_1.eq)(schema_1.automationLogs.accountId, schema_1.connectedAccounts.id))
            .where((0, drizzle_orm_1.eq)(schema_1.connectedAccounts.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.automationLogs.createdAt))
            .limit(limit);
    }
    async incrementUsage(userId, type) {
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        // Check if record exists
        const [existing] = await db_1.db.select()
            .from(schema_1.usageTracking)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.usageTracking.userId, userId), (0, drizzle_orm_1.eq)(schema_1.usageTracking.month, currentMonth)));
        if (existing) {
            await db_1.db.update(schema_1.usageTracking)
                .set({
                replyCount: type === 'reply' ? existing.replyCount + 1 : existing.replyCount,
                dmCount: type === 'dm' ? existing.dmCount + 1 : existing.dmCount,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.usageTracking.id, existing.id));
        }
        else {
            await db_1.db.insert(schema_1.usageTracking).values({
                userId,
                month: currentMonth,
                replyCount: type === 'reply' ? 1 : 0,
                dmCount: type === 'dm' ? 1 : 0,
            });
        }
    }
    async logAction(accountId, ruleId, actionType, status, errorMessage) {
        await db_1.db.insert(schema_1.automationLogs).values({
            accountId,
            ruleId,
            actionType,
            status,
            errorMessage,
        });
    }
}
exports.AnalyticsService = AnalyticsService;
