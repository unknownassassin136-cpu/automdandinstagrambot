import { relations } from 'drizzle-orm';
import { 
  users, refreshTokens, sessions, subscriptions, connectedAccounts, 
  instagramMedia, automationRules, automationTemplates, automationLogs, 
  usageTracking, auditLogs, userFeatureFlags, featureFlags, 
  supportTickets, ticketReplies, notifications, webhookEvents, apiKeys 
} from './schema';

export const usersRelations = relations(users, ({ one, many }) => ({
  subscription: one(subscriptions, { fields: [users.id], references: [subscriptions.userId] }),
  refreshTokens: many(refreshTokens),
  sessions: many(sessions),
  connectedAccounts: many(connectedAccounts),
  usageTracking: many(usageTracking),
  auditLogs: many(auditLogs),
  userFeatureFlags: many(userFeatureFlags),
  supportTickets: many(supportTickets),
  notifications: many(notifications),
  apiKeys: many(apiKeys),
}));

export const connectedAccountsRelations = relations(connectedAccounts, ({ one, many }) => ({
  user: one(users, { fields: [connectedAccounts.userId], references: [users.id] }),
  instagramMedia: many(instagramMedia),
  automationRules: many(automationRules),
  automationTemplates: many(automationTemplates),
  automationLogs: many(automationLogs),
  webhookEvents: many(webhookEvents),
}));

export const automationRulesRelations = relations(automationRules, ({ one, many }) => ({
  account: one(connectedAccounts, { fields: [automationRules.accountId], references: [connectedAccounts.id] }),
  logs: many(automationLogs),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one, many }) => ({
  user: one(users, { fields: [supportTickets.userId], references: [users.id] }),
  assignedAdmin: one(users, { fields: [supportTickets.assignedAdmin], references: [users.id] }),
  replies: many(ticketReplies),
}));

export const featureFlagsRelations = relations(featureFlags, ({ many }) => ({
  userFeatureFlags: many(userFeatureFlags),
}));

export const userFeatureFlagsRelations = relations(userFeatureFlags, ({ one }) => ({
  user: one(users, { fields: [userFeatureFlags.userId], references: [users.id] }),
  featureFlag: one(featureFlags, { fields: [userFeatureFlags.featureFlagId], references: [featureFlags.id] }),
}));
