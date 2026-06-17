import { db } from '../../database/db';
import { connectedAccounts } from '../../database/schema';
import { eq, and, isNull } from 'drizzle-orm';

export class AccountsRepository {
  async create(data: {
    userId: string;
    facebookPageId: string;
    instagramBusinessAccountId: string;
    pageName: string;
    instagramUsername: string;
    encryptedPageAccessToken: string;
    tokenExpiresAt: Date;
  }) {
    const [account] = await db.insert(connectedAccounts).values(data).returning();
    return account;
  }

  async findByUserId(userId: string) {
    return db.select()
      .from(connectedAccounts)
      .where(
        and(
          eq(connectedAccounts.userId, userId),
          isNull(connectedAccounts.deletedAt)
        )
      );
  }

  async findById(accountId: string) {
    const [account] = await db.select()
      .from(connectedAccounts)
      .where(
        and(
          eq(connectedAccounts.id, accountId),
          isNull(connectedAccounts.deletedAt)
        )
      );
    return account;
  }

  async softDelete(accountId: string) {
    await db.update(connectedAccounts)
      .set({ deletedAt: new Date(), isActive: false })
      .where(eq(connectedAccounts.id, accountId));
  }

  async update(accountId: string, data: Partial<typeof connectedAccounts.$inferInsert>) {
    const [account] = await db.update(connectedAccounts)
      .set(data)
      .where(eq(connectedAccounts.id, accountId))
      .returning();
    return account;
  }

  async findByInstagramId(instagramId: string) {
    return db.select()
      .from(connectedAccounts)
      .where(
        and(
          eq(connectedAccounts.instagramBusinessAccountId, instagramId),
          isNull(connectedAccounts.deletedAt)
        )
      );
  }
}
