import { WebhooksRepository } from './webhooks.repository';
import { RulesRepository } from '../automations/rules.repository';
import { AccountsRepository } from '../accounts/accounts.repository';
import crypto from 'crypto';
import { env } from '../../config/env';
import axios from 'axios';
import { decrypt } from '../../shared/encryption';

export class WebhooksService {
  constructor(
    private webhooksRepo: WebhooksRepository = new WebhooksRepository(),
    private rulesRepo: RulesRepository = new RulesRepository(),
    private accountsRepo: AccountsRepository = new AccountsRepository()
  ) {}

  verifySignature(signature: string, payload: Buffer): boolean {
    if (!signature) return false;

    const expectedSignature = 'sha256=' + crypto
      .createHmac('sha256', env.META_APP_SECRET)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  async processIncomingWebhook(payload: any) {
    if (payload.object !== 'instagram') return;

    for (const entry of payload.entry) {
      const accountId = entry.id; // Instagram Business Account ID
      
      if (!entry.changes) continue;

      for (const change of entry.changes) {
        if (change.field === 'comments') {
          const commentData = change.value;
          const commentId = commentData.id;
          const commentText = commentData.text || '';
          const senderId = commentData.from.id;
          const mediaId = commentData.media.id;
          
          // Don't reply to our own comments
          if (senderId === accountId) continue;

          const eventId = `ig_comment_${commentId}_${new Date().getTime()}`;

          // Deduplication
          const isProcessed = await this.webhooksRepo.isEventProcessed(eventId);
          if (isProcessed) continue;

          // Find Connected Account
          const accounts = await this.accountsRepo.findByInstagramId(accountId);
          if (accounts.length === 0) {
            console.error(`No connected account found for IG ID ${accountId}`);
            continue;
          }
          const internalAccount = accounts[0];
          const accessToken = decrypt(internalAccount.encryptedPageAccessToken);

          await this.webhooksRepo.logEvent(eventId, commentData, internalAccount.id);
          await this.webhooksRepo.markEventAsProcessed(eventId);
          
          // Match Rules
          const rules = await this.rulesRepo.findByAccountId(internalAccount.id);
          
          let matchedRule = null;
          let defaultRule = null;
          let bestMatchScore = -1;

          for (const rule of rules) {
            if (!rule.isActive) continue;

            if ((rule as any).isDefaultRule) {
              defaultRule = rule;
              continue;
            }

            // Check Media Matching
            const hasSpecificMedia = !!(rule as any).targetMediaId;
            const matchesSpecificMedia = hasSpecificMedia && (rule as any).targetMediaId === mediaId;
            const isGlobalMedia = !hasSpecificMedia;

            // If the rule is for a specific media, but NOT this media, skip it
            if (hasSpecificMedia && !matchesSpecificMedia) continue;

            // Check Keyword Matching
            const matchesKeyword = rule.triggerKeyword && commentText.toLowerCase().includes(rule.triggerKeyword.toLowerCase());

            if (matchesKeyword) {
              let score = 0;
              // Specific Post rules take priority over Global rules
              if (hasSpecificMedia) score += 10;
              // Exact match takes priority over Contains match (if implemented later)
              if (rule.triggerType === 'comment_exact' || rule.triggerType === 'dm_exact') score += 5;

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
                  await axios.post(`https://graph.facebook.com/v19.0/${commentId}/replies`, {
                    message: finalRule.replyCommentText
                  }, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                  });
                  console.log(`[Webhooks] Replied to comment ${commentId}`);
                } catch (err: any) {
                  console.error(`[Webhooks] Failed to reply to comment ${commentId}:`, err.response?.data || err.message);
                }
              }

              // 2. Send DM (Private Reply)
              if (finalRule.dmTemplateText) {
                try {
                  await axios.post(`https://graph.facebook.com/v19.0/${internalAccount.facebookPageId}/messages`, {
                    recipient: { comment_id: commentId },
                    message: { text: finalRule.dmTemplateText }
                  }, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                  });
                  console.log(`[Webhooks] Sent DM (Private Reply) for comment ${commentId}`);
                } catch (err: any) {
                  console.error(`[Webhooks] Failed to send DM for comment ${commentId}:`, err.response?.data || err.message);
                }
              }
          }
        }
      }
    }
  }
}
