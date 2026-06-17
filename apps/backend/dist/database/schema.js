"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeys = exports.webhookEvents = exports.announcements = exports.notifications = exports.ticketReplies = exports.supportTickets = exports.userFeatureFlags = exports.featureFlags = exports.auditLogs = exports.processedEvents = exports.usageTracking = exports.automationLogs = exports.automationTemplates = exports.automationRules = exports.instagramMedia = exports.connectedAccounts = exports.subscriptions = exports.sessions = exports.refreshTokens = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
// 1. USERS
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    firstName: (0, pg_core_1.varchar)('first_name', { length: 100 }).notNull(),
    lastName: (0, pg_core_1.varchar)('last_name', { length: 100 }).notNull(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).unique().notNull(),
    passwordHash: (0, pg_core_1.text)('password_hash'),
    profileImageUrl: (0, pg_core_1.text)('profile_image_url'),
    provider: (0, pg_core_1.varchar)('provider', { length: 20 }).default('email'),
    emailVerified: (0, pg_core_1.boolean)('email_verified').default(false),
    role: (0, pg_core_1.varchar)('role', { length: 20 }).default('user'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
});
// 2. REFRESH TOKENS
exports.refreshTokens = (0, pg_core_1.pgTable)('refresh_tokens', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id, { onDelete: 'cascade' }),
    tokenHash: (0, pg_core_1.varchar)('token_hash', { length: 255 }).notNull(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at', { withTimezone: true }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
});
// 3. SESSIONS
exports.sessions = (0, pg_core_1.pgTable)('sessions', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id, { onDelete: 'cascade' }),
    deviceName: (0, pg_core_1.varchar)('device_name', { length: 255 }),
    browser: (0, pg_core_1.varchar)('browser', { length: 255 }),
    ipAddress: (0, pg_core_1.varchar)('ip_address', { length: 45 }),
    lastActive: (0, pg_core_1.timestamp)('last_active', { withTimezone: true }).defaultNow(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
});
// 4. SUBSCRIPTIONS
exports.subscriptions = (0, pg_core_1.pgTable)('subscriptions', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id, { onDelete: 'cascade' }),
    planName: (0, pg_core_1.varchar)('plan_name', { length: 50 }).notNull().default('free'),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('active'),
    monthlyLimit: (0, pg_core_1.integer)('monthly_limit').default(100),
    maxAccounts: (0, pg_core_1.integer)('max_accounts').default(1),
    expiresAt: (0, pg_core_1.timestamp)('expires_at', { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
});
// 5. CONNECTED ACCOUNTS
exports.connectedAccounts = (0, pg_core_1.pgTable)('connected_accounts', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id, { onDelete: 'cascade' }),
    facebookPageId: (0, pg_core_1.varchar)('facebook_page_id', { length: 100 }),
    instagramBusinessAccountId: (0, pg_core_1.varchar)('instagram_business_account_id', { length: 100 }).notNull(),
    pageName: (0, pg_core_1.varchar)('page_name', { length: 255 }),
    instagramUsername: (0, pg_core_1.varchar)('instagram_username', { length: 255 }),
    encryptedPageAccessToken: (0, pg_core_1.text)('encrypted_page_access_token').notNull(),
    tokenExpiresAt: (0, pg_core_1.timestamp)('token_expires_at', { withTimezone: true }),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    deletedAt: (0, pg_core_1.timestamp)('deleted_at', { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
});
// 6. INSTAGRAM MEDIA
exports.instagramMedia = (0, pg_core_1.pgTable)('instagram_media', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    accountId: (0, pg_core_1.uuid)('account_id').references(() => exports.connectedAccounts.id, { onDelete: 'cascade' }),
    mediaId: (0, pg_core_1.varchar)('media_id', { length: 100 }).notNull(),
    caption: (0, pg_core_1.text)('caption'),
    mediaType: (0, pg_core_1.varchar)('media_type', { length: 20 }),
    thumbnailUrl: (0, pg_core_1.text)('thumbnail_url'),
    permalink: (0, pg_core_1.text)('permalink'),
    timestamp: (0, pg_core_1.timestamp)('timestamp', { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    unqAccountMedia: (0, pg_core_1.uniqueIndex)('unq_account_media').on(table.accountId, table.mediaId)
}));
// 7. AUTOMATION RULES
exports.automationRules = (0, pg_core_1.pgTable)('automation_rules', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    accountId: (0, pg_core_1.uuid)('account_id').references(() => exports.connectedAccounts.id, { onDelete: 'cascade' }),
    triggerKeyword: (0, pg_core_1.varchar)('trigger_keyword', { length: 255 }),
    triggerType: (0, pg_core_1.varchar)('trigger_type', { length: 50 }).default('exact'),
    targetMediaId: (0, pg_core_1.varchar)('target_media_id', { length: 255 }),
    isDefaultRule: (0, pg_core_1.boolean)('is_default_rule').default(false),
    replyCommentText: (0, pg_core_1.text)('reply_comment_text'),
    dmTemplateText: (0, pg_core_1.text)('dm_template_text'),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    deletedAt: (0, pg_core_1.timestamp)('deleted_at', { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
});
// 8. AUTOMATION TEMPLATES
exports.automationTemplates = (0, pg_core_1.pgTable)('automation_templates', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    accountId: (0, pg_core_1.uuid)('account_id').references(() => exports.connectedAccounts.id, { onDelete: 'cascade' }),
    templateName: (0, pg_core_1.varchar)('template_name', { length: 255 }).notNull(),
    templateContent: (0, pg_core_1.text)('template_content').notNull(),
    templateType: (0, pg_core_1.varchar)('template_type', { length: 50 }).default('dm'),
    deletedAt: (0, pg_core_1.timestamp)('deleted_at', { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
});
// 9. AUTOMATION LOGS
exports.automationLogs = (0, pg_core_1.pgTable)('automation_logs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    accountId: (0, pg_core_1.uuid)('account_id').references(() => exports.connectedAccounts.id, { onDelete: 'cascade' }),
    ruleId: (0, pg_core_1.uuid)('rule_id').references(() => exports.automationRules.id, { onDelete: 'set null' }),
    commentId: (0, pg_core_1.varchar)('comment_id', { length: 100 }),
    senderId: (0, pg_core_1.varchar)('sender_id', { length: 100 }),
    actionType: (0, pg_core_1.varchar)('action_type', { length: 50 }).notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('success'),
    errorMessage: (0, pg_core_1.text)('error_message'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
});
// 10. USAGE TRACKING
exports.usageTracking = (0, pg_core_1.pgTable)('usage_tracking', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id, { onDelete: 'cascade' }),
    month: (0, pg_core_1.varchar)('month', { length: 7 }).notNull(), // format YYYY-MM
    replyCount: (0, pg_core_1.integer)('reply_count').default(0),
    dmCount: (0, pg_core_1.integer)('dm_count').default(0),
}, (table) => ({
    unqUserMonth: (0, pg_core_1.uniqueIndex)('unq_user_month').on(table.userId, table.month)
}));
// 11. PROCESSED EVENTS
exports.processedEvents = (0, pg_core_1.pgTable)('processed_events', {
    eventId: (0, pg_core_1.varchar)('event_id', { length: 255 }).primaryKey(),
    processedAt: (0, pg_core_1.timestamp)('processed_at', { withTimezone: true }).defaultNow(),
});
// 12. AUDIT LOGS
exports.auditLogs = (0, pg_core_1.pgTable)('audit_logs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id, { onDelete: 'set null' }),
    action: (0, pg_core_1.varchar)('action', { length: 100 }).notNull(),
    entityType: (0, pg_core_1.varchar)('entity_type', { length: 50 }),
    entityId: (0, pg_core_1.uuid)('entity_id'),
    metadata: (0, pg_core_1.jsonb)('metadata').default('{}'),
    ipAddress: (0, pg_core_1.varchar)('ip_address', { length: 45 }),
    userAgent: (0, pg_core_1.text)('user_agent'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
});
// 13. FEATURE FLAGS
exports.featureFlags = (0, pg_core_1.pgTable)('feature_flags', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).unique().notNull(),
    description: (0, pg_core_1.text)('description'),
    enabled: (0, pg_core_1.boolean)('enabled').default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
});
// 14. USER FEATURE FLAGS
exports.userFeatureFlags = (0, pg_core_1.pgTable)('user_feature_flags', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id, { onDelete: 'cascade' }),
    featureFlagId: (0, pg_core_1.uuid)('feature_flag_id').references(() => exports.featureFlags.id, { onDelete: 'cascade' }),
}, (table) => ({
    unqUserFeature: (0, pg_core_1.uniqueIndex)('unq_user_feature').on(table.userId, table.featureFlagId)
}));
// 15. SUPPORT TICKETS
exports.supportTickets = (0, pg_core_1.pgTable)('support_tickets', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id, { onDelete: 'cascade' }),
    subject: (0, pg_core_1.varchar)('subject', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description').notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('open'),
    priority: (0, pg_core_1.varchar)('priority', { length: 20 }).default('medium'),
    assignedAdmin: (0, pg_core_1.uuid)('assigned_admin').references(() => exports.users.id, { onDelete: 'set null' }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
});
// 16. TICKET REPLIES
exports.ticketReplies = (0, pg_core_1.pgTable)('ticket_replies', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    ticketId: (0, pg_core_1.uuid)('ticket_id').references(() => exports.supportTickets.id, { onDelete: 'cascade' }),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id, { onDelete: 'set null' }),
    message: (0, pg_core_1.text)('message').notNull(),
    isAdmin: (0, pg_core_1.boolean)('is_admin').default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
});
// 17. NOTIFICATIONS
exports.notifications = (0, pg_core_1.pgTable)('notifications', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id, { onDelete: 'cascade' }),
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    message: (0, pg_core_1.text)('message').notNull(),
    type: (0, pg_core_1.varchar)('type', { length: 50 }).notNull(),
    isRead: (0, pg_core_1.boolean)('is_read').default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
});
// 18. ANNOUNCEMENTS
exports.announcements = (0, pg_core_1.pgTable)('announcements', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    content: (0, pg_core_1.text)('content').notNull(),
    type: (0, pg_core_1.varchar)('type', { length: 20 }).default('info'),
    isActive: (0, pg_core_1.boolean)('is_active').default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    expiresAt: (0, pg_core_1.timestamp)('expires_at', { withTimezone: true }),
});
// 19. WEBHOOK EVENTS
exports.webhookEvents = (0, pg_core_1.pgTable)('webhook_events', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    eventId: (0, pg_core_1.varchar)('event_id', { length: 255 }).notNull(),
    accountId: (0, pg_core_1.uuid)('account_id').references(() => exports.connectedAccounts.id, { onDelete: 'set null' }),
    payload: (0, pg_core_1.jsonb)('payload').notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('received'),
    errorMessage: (0, pg_core_1.text)('error_message'),
    processedAt: (0, pg_core_1.timestamp)('processed_at', { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
});
// 20. API KEYS
exports.apiKeys = (0, pg_core_1.pgTable)('api_keys', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').references(() => exports.users.id, { onDelete: 'cascade' }),
    keyName: (0, pg_core_1.varchar)('key_name', { length: 100 }).notNull(),
    hashedKey: (0, pg_core_1.varchar)('hashed_key', { length: 255 }).notNull(),
    lastUsedAt: (0, pg_core_1.timestamp)('last_used_at', { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
});
// ... more exported types as needed
