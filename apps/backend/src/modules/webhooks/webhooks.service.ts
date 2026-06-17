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
      
      // Find Connected Account FIRST
      const accounts = await this.accountsRepo.findByInstagramId(accountId);
      if (accounts.length === 0) {
        console.error(`No connected account found for IG ID ${accountId}`);
        continue;
      }
      const internalAccount = accounts[0];
      const accessToken = decrypt(internalAccount.encryptedPageAccessToken);
      
      // 1. Process Direct Messages
      // Messages can arrive in entry.messaging or entry.changes depending on Meta's internal routing
      const messageEvents: any[] = [];
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
        
        if (!senderId || senderId === accountId) continue;
        if (!messageText) continue;

        const eventId = `ig_message_${messageId}_${new Date().getTime()}`;
        const isProcessed = await this.webhooksRepo.isEventProcessed(eventId);
        if (isProcessed) continue;
        
        await this.webhooksRepo.logEvent(eventId, msgEvent, internalAccount.id);
        await this.webhooksRepo.markEventAsProcessed(eventId);
        
        const finalRule = await this.matchRule(internalAccount.id, messageText, null);
        
        if (finalRule && finalRule.dmTemplateText) {
          console.log(`[Webhooks] Matched Rule: ${finalRule.triggerKeyword || 'DEFAULT'} for DM: ${messageText}`);
          try {
            // Direct Instagram API for DM Replies
            await axios.post(`https://graph.instagram.com/v22.0/me/messages`, {
              recipient: { id: senderId },
              message: { text: finalRule.dmTemplateText }
            }, {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            console.log(`[Webhooks] Sent DM Reply to ${senderId}`);
          } catch (err: any) {
            console.error(`[Webhooks] Failed to send DM reply:`, err.response?.data || err.message);
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
            if (!senderId || senderId === accountId) continue;

            const eventId = `ig_comment_${commentId}_${new Date().getTime()}`;

            const isProcessed = await this.webhooksRepo.isEventProcessed(eventId);
            if (isProcessed) continue;

            await this.webhooksRepo.logEvent(eventId, commentData, internalAccount.id);
            await this.webhooksRepo.markEventAsProcessed(eventId);
            
            const finalRule = await this.matchRule(internalAccount.id, commentText, mediaId);

            if (finalRule) {
              console.log(`[Webhooks] Matched Rule: ${finalRule.triggerKeyword || 'DEFAULT'} for comment: ${commentText}`);
              
              // 2a. Send Public Comment Reply
              if (finalRule.replyCommentText) {
                try {
                  // Direct Instagram API for public comment replies
                  await axios.post(`https://graph.instagram.com/v22.0/${commentId}/replies`, {
                    message: finalRule.replyCommentText
                  }, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                  });
                  console.log(`[Webhooks] Replied to comment ${commentId}`);
                } catch (err: any) {
                  console.error(`[Webhooks] Failed to reply to comment ${commentId}:`, err.response?.data || err.message);
                }
              }

              // 2b. Send Private DM Reply to Comment
              if (finalRule.dmTemplateText) {
                try {
                  // Direct Instagram API for private replies to comments
                  await axios.post(`https://graph.instagram.com/v22.0/me/messages`, {
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

  private async matchRule(accountId: string, text: string, mediaId: string | null) {
    const rules = await this.rulesRepo.findByAccountId(accountId);
    let matchedRule = null;
    let defaultRule = null;
    let bestMatchScore = -1;

    for (const rule of rules) {
      if (!rule.isActive) continue;

      if ((rule as any).isDefaultRule) {
        defaultRule = rule;
        continue;
      }

      const hasSpecificMedia = !!(rule as any).targetMediaId;
      const matchesSpecificMedia = hasSpecificMedia && (rule as any).targetMediaId === mediaId;
      
      if (hasSpecificMedia && !matchesSpecificMedia) continue;
      if (hasSpecificMedia && !mediaId) continue;

      const matchesKeyword = rule.triggerKeyword && text.toLowerCase().includes(rule.triggerKeyword.toLowerCase());

      if (matchesKeyword) {
        let score = 0;
        if (hasSpecificMedia) score += 10;
        if (rule.triggerType === 'comment_exact' || rule.triggerType === 'dm_exact') score += 5;

        if (score > bestMatchScore) {
          bestMatchScore = score;
          matchedRule = rule;
        }
      }
    }

    return matchedRule || defaultRule;
  }
}
