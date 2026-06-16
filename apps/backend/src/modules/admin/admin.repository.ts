import { db } from '../../database/db';
import { auditLogs, webhookEvents } from '../../database/schema';
import { desc } from 'drizzle-orm';

export class AdminRepository {
  async getAuditLogs(limit = 50) {
    return db.select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }

  async getWebhookEvents(limit = 50) {
    return db.select()
      .from(webhookEvents)
      .orderBy(desc(webhookEvents.createdAt))
      .limit(limit);
  }
}
