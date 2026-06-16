import { db } from '../../database/db';
import { supportTickets } from '../../database/schema';
import { eq, desc } from 'drizzle-orm';

export class TicketsRepository {
  async getByUserId(userId: string) {
    return db.select()
      .from(supportTickets)
      .where(eq(supportTickets.userId, userId))
      .orderBy(desc(supportTickets.createdAt));
  }

  async getAll() {
    return db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
  }

  async create(data: { userId: string; subject: string; description: string; priority: string }) {
    const [ticket] = await db.insert(supportTickets).values({
      ...data,
      status: 'open'
    }).returning();
    return ticket;
  }

  async updateStatus(ticketId: string, status: string) {
    const [ticket] = await db.update(supportTickets)
      .set({ status, updatedAt: new Date() })
      .where(eq(supportTickets.id, ticketId))
      .returning();
    return ticket;
  }
}
