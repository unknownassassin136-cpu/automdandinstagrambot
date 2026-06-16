import { db } from '../../database/db';
import { automationTemplates } from '../../database/schema';
import { eq, and, isNull } from 'drizzle-orm';

export class TemplatesRepository {
  async create(data: { accountId: string; templateName: string; templateContent: string; templateType?: string }) {
    const [template] = await db.insert(automationTemplates).values(data).returning();
    return template;
  }

  async findByAccountId(accountId: string) {
    return db.select()
      .from(automationTemplates)
      .where(
        and(
          eq(automationTemplates.accountId, accountId),
          isNull(automationTemplates.deletedAt)
        )
      );
  }

  async findById(templateId: string) {
    const [template] = await db.select()
      .from(automationTemplates)
      .where(
        and(
          eq(automationTemplates.id, templateId),
          isNull(automationTemplates.deletedAt)
        )
      );
    return template;
  }

  async update(templateId: string, data: Partial<{ templateName: string; templateContent: string; templateType: string }>) {
    const [template] = await db.update(automationTemplates)
      .set(data)
      .where(eq(automationTemplates.id, templateId))
      .returning();
    return template;
  }

  async softDelete(templateId: string) {
    await db.update(automationTemplates)
      .set({ deletedAt: new Date() })
      .where(eq(automationTemplates.id, templateId));
  }
}
