"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const webhooks_repository_1 = require("./webhooks.repository");
const rules_repository_1 = require("../automations/rules.repository");
const accounts_repository_1 = require("../accounts/accounts.repository");
const subscriptions_service_1 = require("../subscriptions/subscriptions.service");
const analytics_service_1 = require("../analytics/analytics.service");
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../../config/env");
const axios_1 = __importDefault(require("axios"));
const encryption_1 = require("../../shared/encryption");
class WebhooksService {
    webhooksRepo;
    rulesRepo;
    accountsRepo;
    subsService;
    analyticsService;
    constructor(webhooksRepo = new webhooks_repository_1.WebhooksRepository(), rulesRepo = new rules_repository_1.RulesRepository(), accountsRepo = new accounts_repository_1.AccountsRepository(), subsService = new subscriptions_service_1.SubscriptionsService(), analyticsService = new analytics_service_1.AnalyticsService()) {
        this.webhooksRepo = webhooksRepo;
        this.rulesRepo = rulesRepo;
        this.accountsRepo = accountsRepo;
        this.subsService = subsService;
        this.analyticsService = analyticsService;
    }
    verifySignature(signature, payload) {
        if (!signature)
            return false;
        const expectedSignature = 'sha256=' + crypto_1.default
            .createHmac('sha256', env_1.env.META_APP_SECRET)
            .update(payload)
            .digest('hex');
        return crypto_1.default.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    }
    async processIncomingWebhook(payload) {
        if (payload.object !== 'instagram')
            return;
        for (const entry of payload.entry) {
            const originalAccountId = entry.id;
            let accountId = entry.id; // Instagram Business Account ID
            // Temporary hack: Map legacy Webhook ID to new IGSID for 3dhub_official
            if (accountId === '17841475040051469') {
                accountId = '28575411545382951';
            }
            // Temporary hack: Map legacy Webhook ID to new IGSID for bindhu_exp
            if (accountId === '17841477884718775') {
                accountId = '27134915662866651';
            }
            // Find Connected Account FIRST
            const accounts = await this.accountsRepo.findByInstagramId(accountId);
            if (accounts.length === 0) {
                console.error(`No connected account found for IG ID ${accountId} (Original: ${entry.id})`);
                continue;
            }
            const internalAccount = accounts[0];
            const accessToken = (0, encryption_1.decrypt)(internalAccount.encryptedPageAccessToken);
            // 1. Process Direct Messages
            // Messages can arrive in entry.messaging or entry.changes depending on Meta's internal routing
            const messageEvents = [];
            if (entry.messaging) {
                messageEvents.push(...entry.messaging);
            }
            if (entry.changes) {
                for (const change of entry.changes) {
                    if (change.field === 'messages') {
                        messageEvents.push(change.value);
                    }
                }
            }
            for (const msgEvent of messageEvents) {
                const senderId = msgEvent.sender?.id;
                const messageId = msgEvent.message?.mid;
                const messageText = msgEvent.message?.text || '';
                if (!senderId || senderId === accountId || senderId === originalAccountId)
                    continue;
                if (!messageText)
                    continue;
                const eventId = `ig_message_${messageId}`;
                const isProcessed = await this.webhooksRepo.isEventProcessed(eventId);
                if (isProcessed)
                    continue;
                await this.webhooksRepo.logEvent(eventId, msgEvent, internalAccount.id);
                await this.webhooksRepo.markEventAsProcessed(eventId);
                const finalRule = await this.matchRule(internalAccount.id, messageText, null);
                if (finalRule && finalRule.dmTemplateText) {
                    console.log(`[Webhooks] Matched Rule: ${finalRule.triggerKeyword || 'DEFAULT'} for DM: ${messageText}`);
                    // Check Subscription Limits
                    const billingStatus = await this.subsService.getBillingStatus(internalAccount.userId);
                    const totalUsage = (billingStatus.currentReplies || 0) + (billingStatus.currentDms || 0);
                    if (billingStatus.monthlyLimit !== -1 && totalUsage >= billingStatus.monthlyLimit) {
                        console.warn(`[Webhooks] Limit Reached for user ${internalAccount.userId}. Skipping DM.`);
                        await this.analyticsService.logAction(internalAccount.id, finalRule.id, 'dm', 'failed', 'Subscription limit reached');
                        continue;
                    }
                    try {
                        // Direct Instagram API for DM Replies
                        await axios_1.default.post(`https://graph.instagram.com/v22.0/me/messages`, {
                            recipient: { id: senderId },
                            message: { text: finalRule.dmTemplateText }
                        }, {
                            headers: { Authorization: `Bearer ${accessToken}` }
                        });
                        console.log(`[Webhooks] Sent DM Reply to ${senderId}`);
                        await this.analyticsService.incrementUsage(internalAccount.userId, 'dm');
                        await this.analyticsService.logAction(internalAccount.id, finalRule.id, 'dm', 'success');
                    }
                    catch (err) {
                        console.error(`[Webhooks] Failed to send DM reply:`, err.response?.data || err.message);
                        await this.analyticsService.logAction(internalAccount.id, finalRule.id, 'dm', 'failed', err.message);
                    }
                }
            }
            // 2. Process Comments
            if (entry.changes) {
                for (const change of entry.changes) {
                    if (change.field === 'comments') {
                        const commentData = change.value;
                        const commentId = commentData.id;
                        const commentText = commentData.text || '';
                        const senderId = commentData.from?.id;
                        const mediaId = commentData.media?.id;
                        // Don't reply to our own comments
                        if (!senderId || senderId === accountId || senderId === originalAccountId)
                            continue;
                        const eventId = `ig_comment_${commentId}`;
                        const isProcessed = await this.webhooksRepo.isEventProcessed(eventId);
                        if (isProcessed)
                            continue;
                        await this.webhooksRepo.logEvent(eventId, commentData, internalAccount.id);
                        await this.webhooksRepo.markEventAsProcessed(eventId);
                        const finalRule = await this.matchRule(internalAccount.id, commentText, mediaId);
                        if (finalRule) {
                            console.log(`[Webhooks] Matched Rule: ${finalRule.triggerKeyword || 'DEFAULT'} for comment: ${commentText}`);
                            // Check Subscription Limits
                            const billingStatus = await this.subsService.getBillingStatus(internalAccount.userId);
                            const totalUsage = (billingStatus.currentReplies || 0) + (billingStatus.currentDms || 0);
                            if (billingStatus.monthlyLimit !== -1 && totalUsage >= billingStatus.monthlyLimit) {
                                console.warn(`[Webhooks] Limit Reached for user ${internalAccount.userId}. Skipping comment reply.`);
                                await this.analyticsService.logAction(internalAccount.id, finalRule.id, 'comment_reply', 'failed', 'Subscription limit reached');
                                continue;
                            }
                            // 2a. Send Public Comment Reply
                            if (finalRule.replyCommentText) {
                                try {
                                    // Direct Instagram API for public comment replies
                                    await axios_1.default.post(`https://graph.instagram.com/v22.0/${commentId}/replies`, {
                                        message: finalRule.replyCommentText
                                    }, {
                                        headers: { Authorization: `Bearer ${accessToken}` }
                                    });
                                    console.log(`[Webhooks] Replied to comment ${commentId}`);
                                    await this.analyticsService.incrementUsage(internalAccount.userId, 'reply');
                                    await this.analyticsService.logAction(internalAccount.id, finalRule.id, 'comment_reply', 'success');
                                }
                                catch (err) {
                                    console.error(`[Webhooks] Failed to reply to comment ${commentId}:`, err.response?.data || err.message);
                                    await this.analyticsService.logAction(internalAccount.id, finalRule.id, 'comment_reply', 'failed', err.message);
                                }
                            }
                            // 2b. Send Private DM Reply to Comment
                            if (finalRule.dmTemplateText) {
                                try {
                                    // Direct Instagram API for private replies to comments
                                    await axios_1.default.post(`https://graph.instagram.com/v22.0/me/messages`, {
                                        recipient: { comment_id: commentId },
                                        message: { text: finalRule.dmTemplateText }
                                    }, {
                                        headers: { Authorization: `Bearer ${accessToken}` }
                                    });
                                    console.log(`[Webhooks] Sent DM (Private Reply) for comment ${commentId}`);
                                    await this.analyticsService.incrementUsage(internalAccount.userId, 'dm');
                                    await this.analyticsService.logAction(internalAccount.id, finalRule.id, 'dm', 'success');
                                }
                                catch (err) {
                                    console.error(`[Webhooks] Failed to send DM for comment ${commentId}:`, err.response?.data || err.message);
                                    await this.analyticsService.logAction(internalAccount.id, finalRule.id, 'dm', 'failed', err.message);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    async matchRule(accountId, text, mediaId) {
        const rules = await this.rulesRepo.findByAccountId(accountId);
        let matchedRule = null;
        let defaultRule = null;
        let bestMatchScore = -1;
        for (const rule of rules) {
            if (!rule.isActive)
                continue;
            if (rule.isDefaultRule) {
                defaultRule = rule;
                continue;
            }
            const hasSpecificMedia = !!rule.targetMediaId;
            const matchesSpecificMedia = hasSpecificMedia && rule.targetMediaId === mediaId;
            if (hasSpecificMedia && !matchesSpecificMedia)
                continue;
            if (hasSpecificMedia && !mediaId)
                continue;
            const matchesKeyword = rule.triggerKeyword && text.toLowerCase().includes(rule.triggerKeyword.toLowerCase());
            if (matchesKeyword) {
                let score = 0;
                if (hasSpecificMedia)
                    score += 10;
                if (rule.triggerType === 'comment_exact' || rule.triggerType === 'dm_exact')
                    score += 5;
                if (score > bestMatchScore) {
                    bestMatchScore = score;
                    matchedRule = rule;
                }
            }
        }
        return matchedRule || defaultRule;
    }
}
exports.WebhooksService = WebhooksService;
