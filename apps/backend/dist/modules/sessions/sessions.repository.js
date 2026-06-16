"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionsRepository = void 0;
const db_1 = require("../../database/db");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
class SessionsRepository {
    async create(data) {
        const [session] = await db_1.db.insert(schema_1.sessions).values(data).returning();
        return session;
    }
    async findByUserId(userId) {
        return db_1.db.select().from(schema_1.sessions).where((0, drizzle_orm_1.eq)(schema_1.sessions.userId, userId));
    }
    async delete(sessionId) {
        await db_1.db.delete(schema_1.sessions).where((0, drizzle_orm_1.eq)(schema_1.sessions.id, sessionId));
    }
    async deleteAllForUser(userId) {
        await db_1.db.delete(schema_1.sessions).where((0, drizzle_orm_1.eq)(schema_1.sessions.userId, userId));
    }
    async updateLastActive(sessionId) {
        await db_1.db.update(schema_1.sessions)
            .set({ lastActive: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.sessions.id, sessionId));
    }
}
exports.SessionsRepository = SessionsRepository;
