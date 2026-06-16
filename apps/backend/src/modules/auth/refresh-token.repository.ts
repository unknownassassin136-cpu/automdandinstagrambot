import { db } from '../../database/db';
import { refreshTokens } from '../../database/schema';
import { eq } from 'drizzle-orm';

export class RefreshTokenRepository {
  async create(userId: string, tokenHash: string, expiresAt: Date) {
    const [token] = await db.insert(refreshTokens).values({
      userId,
      tokenHash,
      expiresAt,
    }).returning();
    return token;
  }

  async findByHash(tokenHash: string) {
    const [token] = await db.select().from(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash));
    return token;
  }

  async deleteByHash(tokenHash: string) {
    await db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash));
  }

  async deleteAllForUser(userId: string) {
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
  }
}
