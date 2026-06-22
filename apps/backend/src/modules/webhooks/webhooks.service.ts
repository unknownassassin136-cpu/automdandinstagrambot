import { WebhooksRepository } from './webhooks.repository';
import { RulesRepository } from '../automations/rules.repository';
import { AccountsRepository } from '../accounts/accounts.repository';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { AnalyticsService } from '../analytics/analytics.service';
import crypto from 'crypto';
import { env } from '../../config/env';
import axios from 'axios';
import { decrypt } from '../../shared/encryption';

export class WebhooksService {
  constructor(
    private webhooksRepo: WebhooksRepository = new WebhooksRepository(),
    private rulesRepo: RulesRepository = new RulesRepository(),
    private accountsRepo: AccountsRepository = new AccountsRepository(),
    private subsService: SubscriptionsService = new SubscriptionsService(),
    private analyticsService: AnalyticsService = new AnalyticsService()
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
        
        if (!senderId || senderId === accountId || senderId === originalAccountId) continue;
        if (!messageText) continue;

        const eventId = `ig_message_${messageId}`;
        const isProcessed = await this.webhooksRepo.isEventProcessed(eventId);
        if (isProcessed) continue;
        
        await this.webhooksRepo.logEvent(eventId, msgEvent, internalAccount.id);
        await this.webhooksRepo.markEventAsProcessed(eventId);
        
        // We log the incoming DM above for Analytics, but we DO NOT evaluate rules 
        // against it, and we DO NOT send any automated replies to incoming DMs.
        // This prevents infinite bot loops and ensures the bot only triggers from comments.
        /*
        const finalRule = await this.matchRule(internalAccount.id, messageText, null);
        
        if (finalRule && finalRule.dmTemplateText) {
          console.log(`[Webhooks] Matched Rule: ${finalRule.triggerKeyword || 'DEFAULT'} for DM: ${messageText}`);

          // Check Subscription Limits
          const billingStatus = await this.subsService.getBillingStatus(internalAccount.userId as string);
          const totalUsage = (billingStatus.currentReplies || 0) + (billingStatus.currentDms || 0);
          
          if (billingStatus.monthlyLimit !== -1 && totalUsage >= billingStatus.monthlyLimit) {
            console.warn(`[Webhooks] Limit Reached for user ${internalAccount.userId}. Skipping DM.`);
            await this.analyticsService.logAction(internalAccount.id, finalRule.id as string, 'dm', 'failed', 'Subscription limit reached');
            continue;
          }

          try {
            // Direct Instagram API for DM Replies
            await axios.post(`https://graph.instagram.com/v22.0/me/messages`, {
              recipient: { id: senderId },
              message: { text: finalRule.dmTemplateText }
            }, {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            console.log(`[Webhooks] Sent DM Reply to ${senderId}`);
            await this.analyticsService.incrementUsage(internalAccount.userId as string, 'dm');
            await this.analyticsService.logAction(internalAccount.id, finalRule.id as string, 'dm', 'success');
          } catch (err: any) {
            console.error(`[Webhooks] Failed to send DM reply:`, err.response?.data || err.message);
            await this.analyticsService.logAction(internalAccount.id, finalRule.id as string, 'dm', 'failed', err.message);
          }
        }
        */
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
            if (!senderId || senderId === accountId || senderId === originalAccountId) continue;

            const eventId = `ig_comment_${commentId}`;

            const isProcessed = await this.webhooksRepo.isEventProcessed(eventId);
            if (isProcessed) continue;

            await this.webhooksRepo.logEvent(eventId, commentData, internalAccount.id);
            await this.webhooksRepo.markEventAsProcessed(eventId);
            
            const finalRule = await this.matchRule(internalAccount.id, commentText, mediaId);

            if (finalRule) {
              console.log(`[Webhooks] Matched Rule: ${finalRule.triggerKeyword || 'DEFAULT'} for comment: ${commentText}`);
              
              // Check Subscription Limits
              const billingStatus = await this.subsService.getBillingStatus(internalAccount.userId as string);
              const totalUsage = (billingStatus.currentReplies || 0) + (billingStatus.currentDms || 0);
              
              if (billingStatus.monthlyLimit !== -1 && totalUsage >= billingStatus.monthlyLimit) {
                console.warn(`[Webhooks] Limit Reached for user ${internalAccount.userId}. Skipping comment reply.`);
                await this.analyticsService.logAction(internalAccount.id, finalRule.id as string, 'comment_reply', 'failed', 'Subscription limit reached');
                continue;
              }

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
                  await this.analyticsService.incrementUsage(internalAccount.userId as string, 'reply');
                  await this.analyticsService.logAction(internalAccount.id, finalRule.id as string, 'comment_reply', 'success');
                } catch (err: any) {
                  console.error(`[Webhooks] Failed to reply to comment ${commentId}:`, err.response?.data || err.message);
                  await this.analyticsService.logAction(internalAccount.id, finalRule.id as string, 'comment_reply', 'failed', err.message);
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
                  await this.analyticsService.incrementUsage(internalAccount.userId as string, 'dm');
                  await this.analyticsService.logAction(internalAccount.id, finalRule.id as string, 'dm', 'success');
                } catch (err: any) {
                  console.error(`[Webhooks] Failed to send DM for comment ${commentId}:`, err.response?.data || err.message);
                  await this.analyticsService.logAction(internalAccount.id, finalRule.id as string, 'dm', 'failed', err.message);
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
    let globalDefaultRule = null;
    let mediaDefaultRule = null;
    let bestMatchScore = -1;

    for (const rule of rules) {
      if (!rule.isActive) continue;

      const hasSpecificMedia = !!(rule as any).targetMediaId;
      const matchesSpecificMedia = hasSpecificMedia && (rule as any).targetMediaId === mediaId;
      
      // If the rule is for a specific media, but this comment/DM is NOT on that media, ignore it entirely
      if (hasSpecificMedia && !matchesSpecificMedia) continue;
      // If the rule is for a specific media, but this is a DM (mediaId is null), ignore it
      if (hasSpecificMedia && !mediaId) continue;

      // Handle Default Catch-All Rules
      if ((rule as any).isDefaultRule) {
        if (hasSpecificMedia) {
          mediaDefaultRule = rule;
        } else {
          globalDefaultRule = rule;
        }
        continue;
      }

      // Keyword Matching
      const matchesKeyword = rule.triggerKeyword && text.toLowerCase().includes(rule.triggerKeyword.toLowerCase());

      if (matchesKeyword) {
        let score = 0;
        if (hasSpecificMedia) score += 10; // Prioritize specific media matches
        if (rule.triggerType === 'comment_exact' || rule.triggerType === 'dm_exact') score += 5;

        if (score > bestMatchScore) {
          bestMatchScore = score;
          matchedRule = rule;
        }
      }
    }

    // Return the best matching keyword rule, OR the specific media default rule, OR the global default rule
    return matchedRule || mediaDefaultRule || globalDefaultRule;
  }
}
