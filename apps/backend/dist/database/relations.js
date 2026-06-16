"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userFeatureFlagsRelations = exports.featureFlagsRelations = exports.supportTicketsRelations = exports.automationRulesRelations = exports.connectedAccountsRelations = exports.usersRelations = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("./schema");
exports.usersRelations = (0, drizzle_orm_1.relations)(schema_1.users, ({ one, many }) => ({
    subscription: one(schema_1.subscriptions, { fields: [schema_1.users.id], references: [schema_1.subscriptions.userId] }),
    refreshTokens: many(schema_1.refreshTokens),
    sessions: many(schema_1.sessions),
    connectedAccounts: many(schema_1.connectedAccounts),
    usageTracking: many(schema_1.usageTracking),
    auditLogs: many(schema_1.auditLogs),
    userFeatureFlags: many(schema_1.userFeatureFlags),
    supportTickets: many(schema_1.supportTickets),
    notifications: many(schema_1.notifications),
    apiKeys: many(schema_1.apiKeys),
}));
exports.connectedAccountsRelations = (0, drizzle_orm_1.relations)(schema_1.connectedAccounts, ({ one, many }) => ({
    user: one(schema_1.users, { fields: [schema_1.connectedAccounts.userId], references: [schema_1.users.id] }),
    instagramMedia: many(schema_1.instagramMedia),
    automationRules: many(schema_1.automationRules),
    automationTemplates: many(schema_1.automationTemplates),
    automationLogs: many(schema_1.automationLogs),
    webhookEvents: many(schema_1.webhookEvents),
}));
exports.automationRulesRelations = (0, drizzle_orm_1.relations)(schema_1.automationRules, ({ one, many }) => ({
    account: one(schema_1.connectedAccounts, { fields: [schema_1.automationRules.accountId], references: [schema_1.connectedAccounts.id] }),
    logs: many(schema_1.automationLogs),
}));
exports.supportTicketsRelations = (0, drizzle_orm_1.relations)(schema_1.supportTickets, ({ one, many }) => ({
    user: one(schema_1.users, { fields: [schema_1.supportTickets.userId], references: [schema_1.users.id] }),
    assignedAdmin: one(schema_1.users, { fields: [schema_1.supportTickets.assignedAdmin], references: [schema_1.users.id] }),
    replies: many(schema_1.ticketReplies),
}));
exports.featureFlagsRelations = (0, drizzle_orm_1.relations)(schema_1.featureFlags, ({ many }) => ({
    userFeatureFlags: many(schema_1.userFeatureFlags),
}));
exports.userFeatureFlagsRelations = (0, drizzle_orm_1.relations)(schema_1.userFeatureFlags, ({ one }) => ({
    user: one(schema_1.users, { fields: [schema_1.userFeatureFlags.userId], references: [schema_1.users.id] }),
    featureFlag: one(schema_1.featureFlags, { fields: [schema_1.userFeatureFlags.featureFlagId], references: [schema_1.featureFlags.id] }),
}));
