"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorTracker = exports.ErrorTrackingService = void 0;
const db_1 = require("../../database/db");
const schema_1 = require("../../database/schema");
class ErrorTrackingService {
    /**
     * Centralized method to log critical application errors.
     * In a real production system, this could also push to Sentry or Datadog.
     */
    async logError(error, context = {}, userId) {
        console.error(`[ERROR TRACKING]`, error.message, { context, userId });
        try {
            // Log to database audit_logs for persistence
            await db_1.db.insert(schema_1.auditLogs).values({
                userId,
                action: 'system_error',
                entityType: 'system',
                metadata: {
                    message: error.message,
                    stack: error.stack,
                    context,
                },
            });
        }
        catch (dbError) {
            console.error('Failed to persist error to database:', dbError);
        }
    }
}
exports.ErrorTrackingService = ErrorTrackingService;
exports.errorTracker = new ErrorTrackingService();
