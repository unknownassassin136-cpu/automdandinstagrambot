"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenRepository = void 0;
const db_1 = require("../../database/db");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
class RefreshTokenRepository {
    async create(userId, tokenHash, expiresAt) {
        const [token] = await db_1.db.insert(schema_1.refreshTokens).values({
            userId,
            tokenHash,
            expiresAt,
        }).returning();
        return token;
    }
    async findByHash(tokenHash) {
        const [token] = await db_1.db.select().from(schema_1.refreshTokens).where((0, drizzle_orm_1.eq)(schema_1.refreshTokens.tokenHash, tokenHash));
        return token;
    }
    async deleteByHash(tokenHash) {
        await db_1.db.delete(schema_1.refreshTokens).where((0, drizzle_orm_1.eq)(schema_1.refreshTokens.tokenHash, tokenHash));
    }
    async deleteAllForUser(userId) {
        await db_1.db.delete(schema_1.refreshTokens).where((0, drizzle_orm_1.eq)(schema_1.refreshTokens.userId, userId));
    }
}
exports.RefreshTokenRepository = RefreshTokenRepository;
