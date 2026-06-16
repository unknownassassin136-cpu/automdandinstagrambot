import { db } from '../../database/db';
import { webhookEvents, processedEvents } from '../../database/schema';
import { eq } from 'drizzle-orm';

export class WebhooksRepository {
  async logEvent(eventId: string, payload: any, accountId?: string) {
    const [event] = await db.insert(webhookEvents).values({
      eventId,
      payload,
      accountId,
      status: 'received',
    }).returning();
    return event;
  }

  async updateEventStatus(eventId: string, status: string, errorMessage?: string) {
    await db.update(webhookEvents)
      .set({ 
        status, 
        errorMessage, 
        processedAt: status === 'processed' ? new Date() : undefined 
      })
      .where(eq(webhookEvents.eventId, eventId));
  }

  async markEventAsProcessed(eventId: string) {
    // Keeps a unique record of processed event IDs to prevent duplicate processing
    await db.insert(processedEvents).values({ eventId }).onConflictDoNothing();
  }

  async isEventProcessed(eventId: string): Promise<boolean> {
    const [event] = await db.select().from(processedEvents).where(eq(processedEvents.eventId, eventId));
    return !!event;
  }
}
