import { db } from '../../database/db';
import { automationRules } from '../../database/schema';
import { eq, and, isNull } from 'drizzle-orm';

export class RulesRepository {
  async create(data: {
    accountId: string;
    targetMediaId?: string;
    isDefaultRule?: boolean;
    triggerType?: string;
    triggerKeyword: string;
    replyCommentText?: string;
    dmTemplateText?: string;
    replyCommentVariants?: string[];
    dmTemplateVariants?: string[];
  }) {
    const [rule] = await db.insert(automationRules).values({
      ...data,
    }).returning();
    return rule;
  }

  async findByAccountId(accountId: string) {
    return db.select()
      .from(automationRules)
      .where(
        and(
          eq(automationRules.accountId, accountId),
          isNull(automationRules.deletedAt)
        )
      );
  }

  async findById(ruleId: string) {
    const [rule] = await db.select()
      .from(automationRules)
      .where(
        and(
          eq(automationRules.id, ruleId),
          isNull(automationRules.deletedAt)
        )
      );
    return rule;
  }

  async update(ruleId: string, data: Partial<{
    targetMediaId: string | null;
    isDefaultRule: boolean;
    triggerType: string;
    triggerKeyword: string;
    priority: number;
    replyCommentText: string;
    dmTemplateText: string;
    isActive: boolean;
  }>) {
    const [rule] = await db.update(automationRules)
      .set(data)
      .where(eq(automationRules.id, ruleId))
      .returning();
    return rule;
  }

  async hardDelete(ruleId: string) {
    await db.delete(automationRules).where(eq(automationRules.id, ruleId));
  }
}
