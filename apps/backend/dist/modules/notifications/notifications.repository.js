"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsRepository = void 0;
const db_1 = require("../../database/db");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
class NotificationsRepository {
    async getByUserId(userId, limit = 50) {
        return db_1.db.select()
            .from(schema_1.notifications)
            .where((0, drizzle_orm_1.eq)(schema_1.notifications.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.notifications.createdAt))
            .limit(limit);
    }
    async markAsRead(notificationId) {
        await db_1.db.update(schema_1.notifications)
            .set({ isRead: true })
            .where((0, drizzle_orm_1.eq)(schema_1.notifications.id, notificationId));
    }
    async create(data) {
        const [notification] = await db_1.db.insert(schema_1.notifications).values({
            userId: data.userId,
            title: data.title,
            message: data.content,
            type: data.type,
            isRead: false
        }).returning();
        return notification;
    }
}
exports.NotificationsRepository = NotificationsRepository;
