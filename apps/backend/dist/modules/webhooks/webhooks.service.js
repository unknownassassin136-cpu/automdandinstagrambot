"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const webhooks_repository_1 = require("./webhooks.repository");
const rules_repository_1 = require("../automations/rules.repository");
const accounts_repository_1 = require("../accounts/accounts.repository");
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../../config/env");
const axios_1 = __importDefault(require("axios"));
const encryption_1 = require("../../shared/encryption");
class WebhooksService {
    webhooksRepo;
    rulesRepo;
    accountsRepo;
    constructor(webhooksRepo = new webhooks_repository_1.WebhooksRepository(), rulesRepo = new rules_repository_1.RulesRepository(), accountsRepo = new accounts_repository_1.AccountsRepository()) {
        this.webhooksRepo = webhooksRepo;
        this.rulesRepo = rulesRepo;
        this.accountsRepo = accountsRepo;
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
            const accountId = entry.id; // Instagram Business Account ID
            if (!entry.changes)
                continue;
            for (const change of entry.changes) {
                if (change.field === 'comments') {
                    const commentData = change.value;
                    const commentId = commentData.id;
                    const commentText = commentData.text || '';
                    const senderId = commentData.from.id;
                    const mediaId = commentData.media.id;
                    // Don't reply to our own comments
                    if (senderId === accountId)
                        continue;
                    const eventId = `ig_comment_${commentId}_${new Date().getTime()}`;
                    // Deduplication
                    const isProcessed = await this.webhooksRepo.isEventProcessed(eventId);
                    if (isProcessed)
                        continue;
                    // Find Connected Account
                    const accounts = await this.accountsRepo.findByInstagramId(accountId);
                    if (accounts.length === 0) {
                        console.error(`No connected account found for IG ID ${accountId}`);
                        continue;
                    }
                    const internalAccount = accounts[0];
                    const accessToken = (0, encryption_1.decrypt)(internalAccount.encryptedPageAccessToken);
                    await this.webhooksRepo.logEvent(eventId, commentData, internalAccount.id);
                    await this.webhooksRepo.markEventAsProcessed(eventId);
                    // Match Rules
                    const rules = await this.rulesRepo.findByAccountId(internalAccount.id);
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
                        // Check Media Matching
                        const hasSpecificMedia = !!rule.targetMediaId;
                        const matchesSpecificMedia = hasSpecificMedia && rule.targetMediaId === mediaId;
                        const isGlobalMedia = !hasSpecificMedia;
                        // If the rule is for a specific media, but NOT this media, skip it
                        if (hasSpecificMedia && !matchesSpecificMedia)
                            continue;
                        // Check Keyword Matching
                        const matchesKeyword = rule.triggerKeyword && commentText.toLowerCase().includes(rule.triggerKeyword.toLowerCase());
                        if (matchesKeyword) {
                            let score = 0;
                            // Specific Post rules take priority over Global rules
                            if (hasSpecificMedia)
                                score += 10;
                            // Exact match takes priority over Contains match (if implemented later)
                            if (rule.triggerType === 'comment_exact' || rule.triggerType === 'dm_exact')
                                score += 5;
                            if (score > bestMatchScore) {
                                bestMatchScore = score;
                                matchedRule = rule;
                            }
                        }
                    }
                    const finalRule = matchedRule || defaultRule;
                    if (finalRule) {
                        console.log(`[Webhooks] Matched Rule: ${finalRule.triggerKeyword || 'DEFAULT'} for comment: ${commentText}`);
                        // 1. Send Comment Reply (if configured)
                        if (finalRule.replyCommentText) {
                            try {
                                await axios_1.default.post(`https://graph.facebook.com/v19.0/${commentId}/replies`, {
                                    message: finalRule.replyCommentText
                                }, {
                                    headers: { Authorization: `Bearer ${accessToken}` }
                                });
                                console.log(`[Webhooks] Replied to comment ${commentId}`);
                            }
                            catch (err) {
                                console.error(`[Webhooks] Failed to reply to comment ${commentId}:`, err.response?.data || err.message);
                            }
                        }
                        // 2. Send DM (Private Reply)
                        if (finalRule.dmTemplateText) {
                            try {
                                await axios_1.default.post(`https://graph.facebook.com/v19.0/${internalAccount.facebookPageId}/messages`, {
                                    recipient: { comment_id: commentId },
                                    message: { text: finalRule.dmTemplateText }
                                }, {
                                    headers: { Authorization: `Bearer ${accessToken}` }
                                });
                                console.log(`[Webhooks] Sent DM (Private Reply) for comment ${commentId}`);
                            }
                            catch (err) {
                                console.error(`[Webhooks] Failed to send DM for comment ${commentId}:`, err.response?.data || err.message);
                            }
                        }
                    }
                }
            }
        }
    }
}
exports.WebhooksService = WebhooksService;
