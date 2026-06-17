"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountsRepository = void 0;
const db_1 = require("../../database/db");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
class AccountsRepository {
    async create(data) {
        const [account] = await db_1.db.insert(schema_1.connectedAccounts).values(data).returning();
        return account;
    }
    async findByUserId(userId) {
        return db_1.db.select()
            .from(schema_1.connectedAccounts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.connectedAccounts.userId, userId), (0, drizzle_orm_1.isNull)(schema_1.connectedAccounts.deletedAt)));
    }
    async findById(accountId) {
        const [account] = await db_1.db.select()
            .from(schema_1.connectedAccounts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.connectedAccounts.id, accountId), (0, drizzle_orm_1.isNull)(schema_1.connectedAccounts.deletedAt)));
        return account;
    }
    async softDelete(accountId) {
        await db_1.db.update(schema_1.connectedAccounts)
            .set({ deletedAt: new Date(), isActive: false })
            .where((0, drizzle_orm_1.eq)(schema_1.connectedAccounts.id, accountId));
    }
    async deactivate(accountId) {
        await db_1.db.update(schema_1.connectedAccounts)
            .set({ isActive: false })
            .where((0, drizzle_orm_1.eq)(schema_1.connectedAccounts.id, accountId));
    }
    async update(accountId, data) {
        const [account] = await db_1.db.update(schema_1.connectedAccounts)
            .set(data)
            .where((0, drizzle_orm_1.eq)(schema_1.connectedAccounts.id, accountId))
            .returning();
        return account;
    }
    async findByInstagramId(instagramId, includeDeleted = false) {
        if (includeDeleted) {
            return db_1.db.select()
                .from(schema_1.connectedAccounts)
                .where((0, drizzle_orm_1.eq)(schema_1.connectedAccounts.instagramBusinessAccountId, instagramId));
        }
        return db_1.db.select()
            .from(schema_1.connectedAccounts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.connectedAccounts.instagramBusinessAccountId, instagramId), (0, drizzle_orm_1.isNull)(schema_1.connectedAccounts.deletedAt)));
    }
}
exports.AccountsRepository = AccountsRepository;
