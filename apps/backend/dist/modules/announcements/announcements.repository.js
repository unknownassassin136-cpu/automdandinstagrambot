"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementsRepository = void 0;
const db_1 = require("../../database/db");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
class AnnouncementsRepository {
    async getActiveAnnouncements() {
        return db_1.db.select()
            .from(schema_1.announcements)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.announcements.isActive, true), (0, drizzle_orm_1.sql) `expires_at IS NULL OR expires_at > NOW()`));
    }
    async getAll() {
        return db_1.db.select().from(schema_1.announcements);
    }
    async create(data) {
        const [announcement] = await db_1.db.insert(schema_1.announcements).values(data).returning();
        return announcement;
    }
}
exports.AnnouncementsRepository = AnnouncementsRepository;
