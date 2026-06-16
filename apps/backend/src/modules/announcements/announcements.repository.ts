import { db } from '../../database/db';
import { announcements } from '../../database/schema';
import { eq, and, sql } from 'drizzle-orm';

export class AnnouncementsRepository {
  async getActiveAnnouncements() {
    return db.select()
      .from(announcements)
      .where(
        and(
          eq(announcements.isActive, true),
          sql`expires_at IS NULL OR expires_at > NOW()`
        )
      );
  }

  async getAll() {
    return db.select().from(announcements);
  }

  async create(data: { title: string; content: string; type: string; expiresAt?: Date }) {
    const [announcement] = await db.insert(announcements).values(data).returning();
    return announcement;
  }
}
