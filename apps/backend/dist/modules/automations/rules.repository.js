"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RulesRepository = void 0;
const db_1 = require("../../database/db");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
class RulesRepository {
    async create(data) {
        const [rule] = await db_1.db.insert(schema_1.automationRules).values({
            ...data,
        }).returning();
        return rule;
    }
    async findByAccountId(accountId) {
        return db_1.db.select()
            .from(schema_1.automationRules)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.automationRules.accountId, accountId), (0, drizzle_orm_1.isNull)(schema_1.automationRules.deletedAt)));
    }
    async findById(ruleId) {
        const [rule] = await db_1.db.select()
            .from(schema_1.automationRules)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.automationRules.id, ruleId), (0, drizzle_orm_1.isNull)(schema_1.automationRules.deletedAt)));
        return rule;
    }
    async update(ruleId, data) {
        const [rule] = await db_1.db.update(schema_1.automationRules)
            .set(data)
            .where((0, drizzle_orm_1.eq)(schema_1.automationRules.id, ruleId))
            .returning();
        return rule;
    }
    async hardDelete(ruleId) {
        await db_1.db.delete(schema_1.automationRules).where((0, drizzle_orm_1.eq)(schema_1.automationRules.id, ruleId));
    }
}
exports.RulesRepository = RulesRepository;
