"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsRepository = void 0;
const db_1 = require("../../database/db");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
class TicketsRepository {
    async getByUserId(userId) {
        return db_1.db.select()
            .from(schema_1.supportTickets)
            .where((0, drizzle_orm_1.eq)(schema_1.supportTickets.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.supportTickets.createdAt));
    }
    async getAll() {
        return db_1.db.select().from(schema_1.supportTickets).orderBy((0, drizzle_orm_1.desc)(schema_1.supportTickets.createdAt));
    }
    async create(data) {
        const [ticket] = await db_1.db.insert(schema_1.supportTickets).values({
            ...data,
            status: 'open'
        }).returning();
        return ticket;
    }
    async updateStatus(ticketId, status) {
        const [ticket] = await db_1.db.update(schema_1.supportTickets)
            .set({ status, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.supportTickets.id, ticketId))
            .returning();
        return ticket;
    }
}
exports.TicketsRepository = TicketsRepository;
