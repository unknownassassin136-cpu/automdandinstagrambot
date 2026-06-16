"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRepository = void 0;
const db_1 = require("../../database/db");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
class AdminRepository {
    async getAuditLogs(limit = 50) {
        return db_1.db.select()
            .from(schema_1.auditLogs)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.auditLogs.createdAt))
            .limit(limit);
    }
    async getWebhookEvents(limit = 50) {
        return db_1.db.select()
            .from(schema_1.webhookEvents)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.webhookEvents.createdAt))
            .limit(limit);
    }
}
exports.AdminRepository = AdminRepository;
