import { pgTable, uuid, varchar, text, boolean, timestamp, integer, jsonb, uniqueIndex } from 'drizzle-orm/pg-core';

// 1. USERS
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: text('password_hash'),
  profileImageUrl: text('profile_image_url'),
  provider: varchar('provider', { length: 20 }).default('email'),
  emailVerified: boolean('email_verified').default(false),
  role: varchar('role', { length: 20 }).default('user'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// 2. REFRESH TOKENS
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 3. SESSIONS
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  deviceName: varchar('device_name', { length: 255 }),
  browser: varchar('browser', { length: 255 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  lastActive: timestamp('last_active', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 4. SUBSCRIPTIONS
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  planName: varchar('plan_name', { length: 50 }).notNull().default('free'),
  status: varchar('status', { length: 20 }).default('active'),
  monthlyLimit: integer('monthly_limit').default(100),
  maxAccounts: integer('max_accounts').default(1),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 5. CONNECTED ACCOUNTS
export const connectedAccounts = pgTable('connected_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  facebookPageId: varchar('facebook_page_id', { length: 100 }),
  instagramBusinessAccountId: varchar('instagram_business_account_id', { length: 100 }).notNull(),
  pageName: varchar('page_name', { length: 255 }),
  instagramUsername: varchar('instagram_username', { length: 255 }),
  encryptedPageAccessToken: text('encrypted_page_access_token').notNull(),
  tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true }),
  isActive: boolean('is_active').default(true),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 6. INSTAGRAM MEDIA
export const instagramMedia = pgTable('instagram_media', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').references(() => connectedAccounts.id, { onDelete: 'cascade' }),
  mediaId: varchar('media_id', { length: 100 }).notNull(),
  caption: text('caption'),
  mediaType: varchar('media_type', { length: 20 }),
  thumbnailUrl: text('thumbnail_url'),
  permalink: text('permalink'),
  timestamp: timestamp('timestamp', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  unqAccountMedia: uniqueIndex('unq_account_media').on(table.accountId, table.mediaId)
}));

// 7. AUTOMATION RULES
export const automationRules = pgTable('automation_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').references(() => connectedAccounts.id, { onDelete: 'cascade' }),
  triggerKeyword: varchar('trigger_keyword', { length: 255 }),
  triggerType: varchar('trigger_type', { length: 50 }).default('exact'),
  targetMediaId: varchar('target_media_id', { length: 255 }),
  isDefaultRule: boolean('is_default_rule').default(false),
  replyCommentText: text('reply_comment_text'),
  dmTemplateText: text('dm_template_text'),
  replyCommentVariants: jsonb('reply_comment_variants').$type<string[]>(),
  dmTemplateVariants: jsonb('dm_template_variants').$type<string[]>(),
  isActive: boolean('is_active').default(true),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 8. AUTOMATION TEMPLATES
export const automationTemplates = pgTable('automation_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').references(() => connectedAccounts.id, { onDelete: 'cascade' }),
  templateName: varchar('template_name', { length: 255 }).notNull(),
  templateContent: text('template_content').notNull(),
  templateType: varchar('template_type', { length: 50 }).default('dm'),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 9. AUTOMATION LOGS
export const automationLogs = pgTable('automation_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').references(() => connectedAccounts.id, { onDelete: 'cascade' }),
  ruleId: uuid('rule_id').references(() => automationRules.id, { onDelete: 'set null' }),
  commentId: varchar('comment_id', { length: 100 }),
  senderId: varchar('sender_id', { length: 100 }),
  actionType: varchar('action_type', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).default('success'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 10. USAGE TRACKING
export const usageTracking = pgTable('usage_tracking', {
  id: uuid('id').primaryKey().defaultRandom(),
  ruleId: uuid('rule_id').references(() => automationRules.id, { onDelete: 'cascade' }),
  month: varchar('month', { length: 7 }).notNull(), // format YYYY-MM
  replyCount: integer('reply_count').default(0),
  dmCount: integer('dm_count').default(0),
}, (table) => ({
  unqRuleMonth: uniqueIndex('unq_rule_month').on(table.ruleId, table.month)
}));

// 11. PROCESSED EVENTS
export const processedEvents = pgTable('processed_events', {
  eventId: varchar('event_id', { length: 255 }).primaryKey(),
  processedAt: timestamp('processed_at', { withTimezone: true }).defaultNow(),
});

// 12. AUDIT LOGS
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }),
  entityId: uuid('entity_id'),
  metadata: jsonb('metadata').default('{}'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 13. FEATURE FLAGS
export const featureFlags = pgTable('feature_flags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).unique().notNull(),
  description: text('description'),
  enabled: boolean('enabled').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 14. USER FEATURE FLAGS
export const userFeatureFlags = pgTable('user_feature_flags', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  featureFlagId: uuid('feature_flag_id').references(() => featureFlags.id, { onDelete: 'cascade' }),
}, (table) => ({
  unqUserFeature: uniqueIndex('unq_user_feature').on(table.userId, table.featureFlagId)
}));

// 15. SUPPORT TICKETS
export const supportTickets = pgTable('support_tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  subject: varchar('subject', { length: 255 }).notNull(),
  description: text('description').notNull(),
  status: varchar('status', { length: 20 }).default('open'),
  priority: varchar('priority', { length: 20 }).default('medium'),
  assignedAdmin: uuid('assigned_admin').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// 16. TICKET REPLIES
export const ticketReplies = pgTable('ticket_replies', {
  id: uuid('id').primaryKey().defaultRandom(),
  ticketId: uuid('ticket_id').references(() => supportTickets.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  message: text('message').notNull(),
  isAdmin: boolean('is_admin').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 17. NOTIFICATIONS
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 18. ANNOUNCEMENTS
export const announcements = pgTable('announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  type: varchar('type', { length: 20 }).default('info'),
  isActive: boolean('is_active').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
});

// 19. WEBHOOK EVENTS
export const webhookEvents = pgTable('webhook_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: varchar('event_id', { length: 255 }).notNull(),
  accountId: uuid('account_id').references(() => connectedAccounts.id, { onDelete: 'set null' }),
  payload: jsonb('payload').notNull(),
  status: varchar('status', { length: 20 }).default('received'),
  errorMessage: text('error_message'),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 20. API KEYS
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  keyName: varchar('key_name', { length: 100 }).notNull(),
  hashedKey: varchar('hashed_key', { length: 255 }).notNull(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// TYPE EXPORTS
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type ConnectedAccount = typeof connectedAccounts.$inferSelect;
export type AutomationRule = typeof automationRules.$inferSelect;
export type WebhookEvent = typeof webhookEvents.$inferSelect;
// ... more exported types as needed
