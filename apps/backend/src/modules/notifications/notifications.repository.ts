import { db } from '../../database/db';
import { notifications } from '../../database/schema';
import { eq, desc } from 'drizzle-orm';

export class NotificationsRepository {
  async getByUserId(userId: string, limit = 50) {
    return db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async markAsRead(notificationId: string) {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
  }

  async create(data: { userId: string; title: string; content: string; type: string }) {
    const [notification] = await db.insert(notifications).values({
      userId: data.userId,
      title: data.title,
      message: data.content,
      type: data.type,
      isRead: false
    }).returning();
    return notification;
  }
}
