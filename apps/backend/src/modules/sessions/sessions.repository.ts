import { db } from '../../database/db';
import { sessions } from '../../database/schema';
import { eq } from 'drizzle-orm';

export class SessionsRepository {
  async create(data: { userId: string; deviceName?: string; browser?: string; ipAddress?: string }) {
    const [session] = await db.insert(sessions).values(data).returning();
    return session;
  }

  async findByUserId(userId: string) {
    return db.select().from(sessions).where(eq(sessions.userId, userId));
  }

  async delete(sessionId: string) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  async deleteAllForUser(userId: string) {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  }
  
  async updateLastActive(sessionId: string) {
    await db.update(sessions)
      .set({ lastActive: new Date() })
      .where(eq(sessions.id, sessionId));
  }
}
