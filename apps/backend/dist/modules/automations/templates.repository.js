"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplatesRepository = void 0;
const db_1 = require("../../database/db");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
class TemplatesRepository {
    async create(data) {
        const [template] = await db_1.db.insert(schema_1.automationTemplates).values(data).returning();
        return template;
    }
    async findByAccountId(accountId) {
        return db_1.db.select()
            .from(schema_1.automationTemplates)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.automationTemplates.accountId, accountId), (0, drizzle_orm_1.isNull)(schema_1.automationTemplates.deletedAt)));
    }
    async findById(templateId) {
        const [template] = await db_1.db.select()
            .from(schema_1.automationTemplates)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.automationTemplates.id, templateId), (0, drizzle_orm_1.isNull)(schema_1.automationTemplates.deletedAt)));
        return template;
    }
    async update(templateId, data) {
        const [template] = await db_1.db.update(schema_1.automationTemplates)
            .set(data)
            .where((0, drizzle_orm_1.eq)(schema_1.automationTemplates.id, templateId))
            .returning();
        return template;
    }
    async softDelete(templateId) {
        await db_1.db.update(schema_1.automationTemplates)
            .set({ deletedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.automationTemplates.id, templateId));
    }
}
exports.TemplatesRepository = TemplatesRepository;
