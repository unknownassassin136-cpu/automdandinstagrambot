import { db } from '../../database/db';
import { auditLogs } from '../../database/schema';

export class ErrorTrackingService {
  /**
   * Centralized method to log critical application errors.
   * In a real production system, this could also push to Sentry or Datadog.
   */
  async logError(error: Error, context: Record<string, any> = {}, userId?: string) {
    console.error(`[ERROR TRACKING]`, error.message, { context, userId });

    try {
      // Log to database audit_logs for persistence
      await db.insert(auditLogs).values({
        userId,
        actionType: 'system_error',
        resourceType: 'system',
        resourceId: context.resourceId || 'unknown',
        details: {
          message: error.message,
          stack: error.stack,
          context,
        },
      });
    } catch (dbError) {
      console.error('Failed to persist error to database:', dbError);
    }
  }
}

export const errorTracker = new ErrorTrackingService();
