"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksRepository = void 0;
const db_1 = require("../../database/db");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
class WebhooksRepository {
    async logEvent(eventId, payload, accountId) {
        const [event] = await db_1.db.insert(schema_1.webhookEvents).values({
            eventId,
            payload,
            accountId,
            status: 'received',
        }).returning();
        return event;
    }
    async updateEventStatus(eventId, status, errorMessage) {
        await db_1.db.update(schema_1.webhookEvents)
            .set({
            status,
            errorMessage,
            processedAt: status === 'processed' ? new Date() : undefined
        })
            .where((0, drizzle_orm_1.eq)(schema_1.webhookEvents.eventId, eventId));
    }
    async markEventAsProcessed(eventId) {
        // Keeps a unique record of processed event IDs to prevent duplicate processing
        await db_1.db.insert(schema_1.processedEvents).values({ eventId }).onConflictDoNothing();
    }
    async isEventProcessed(eventId) {
        const [event] = await db_1.db.select().from(schema_1.processedEvents).where((0, drizzle_orm_1.eq)(schema_1.processedEvents.eventId, eventId));
        return !!event;
    }
}
exports.WebhooksRepository = WebhooksRepository;
