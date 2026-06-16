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
        const [{ count }] = await db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(schema_1.connectedAccounts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.connectedAccounts.userId, userId), (0, drizzle_orm_1.sql) `deleted_at IS NULL`));
        return {
            repliesSent: usage?.replyCount || 0,
            dmsSent: usage?.dmCount || 0,
            totalAutomations: (usage?.replyCount || 0) + (usage?.dmCount || 0),
            connectedAccounts: Number(count) || 0,
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
}
exports.AnalyticsService = AnalyticsService;
