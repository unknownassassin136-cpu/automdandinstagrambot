"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsRepository = void 0;
const db_1 = require("../../database/db");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
class SubscriptionsRepository {
    async getByUserId(userId) {
        const [sub] = await db_1.db.select().from(schema_1.subscriptions).where((0, drizzle_orm_1.eq)(schema_1.subscriptions.userId, userId));
        return sub;
    }
    async createOrUpdate(userId, data) {
        const existing = await this.getByUserId(userId);
        if (existing) {
            const [updated] = await db_1.db.update(schema_1.subscriptions)
                .set(data)
                .where((0, drizzle_orm_1.eq)(schema_1.subscriptions.userId, userId))
                .returning();
            return updated;
        }
        else {
            const [created] = await db_1.db.insert(schema_1.subscriptions).values({
                userId,
                ...data,
            }).returning();
            return created;
        }
    }
}
exports.SubscriptionsRepository = SubscriptionsRepository;
