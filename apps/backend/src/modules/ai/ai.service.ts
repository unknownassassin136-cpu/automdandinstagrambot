import OpenAI from 'openai';
import { env } from '../../config/env';
import { AI_CONFIG, SYSTEM_PROMPT_TEMPLATE } from './ai.config';
import { AiSafety } from './ai.safety';

export class AiService {
  private openai: OpenAI;
  private safety: AiSafety;
  private defaultContext: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: env.AI_API_KEY,
      baseURL: env.AI_BASE_URL
    });
    this.safety = new AiSafety();
    this.defaultContext = 'No business context provided by the user. Please politely state that you cannot answer specific business questions until the owner configures the AI.';
  }

  /**
   * Generate an AI reply for an incoming DM.
   * Returns the reply text, or null if the message should not be replied to.
   */
  async generateReply(
    incomingMessage: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; text: string }>,
    customContext?: string | null
  ): Promise<{ reply: string | null; action: 'replied' | 'blocked' | 'warned' | 'off_topic' }> {
    
    // Step 1: Safety pre-filter
    const safetyResult = this.safety.check(incomingMessage);
    
    if (safetyResult === 'INAPPROPRIATE') {
      // Send a warning message instead of silently blocking
      return {
        reply: AI_CONFIG.WARNING_MESSAGE,
        action: 'warned'
      };
    }

    if (safetyResult === 'SPAM') {
      return { reply: null, action: 'blocked' };
    }

    // Step 2: Build the system prompt with business context
    const businessContext = customContext || this.defaultContext;
    const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace('{context}', businessContext);

    // Step 3: Build conversation history for OpenAI
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt }
    ];
    
    // Add conversation history (last N messages)
    const recentHistory = conversationHistory.slice(-AI_CONFIG.MAX_CONVERSATION_HISTORY);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text
      });
    }

    // Add the current incoming message
    messages.push({
      role: 'user',
      content: incomingMessage
    });

    // Step 4: Call OpenAI API
    try {
      const response = await this.openai.chat.completions.create({
        model: env.AI_MODEL,
        messages: messages,
        temperature: AI_CONFIG.TEMPERATURE,
        max_tokens: AI_CONFIG.MAX_OUTPUT_TOKENS,
      });

      const replyText = response.choices[0]?.message?.content?.trim() || null;

      if (!replyText) {
        return { reply: null, action: 'blocked' };
      }

      // Step 5: Check if Gemini returned the [BLOCKED] token
      if (replyText.includes('[BLOCKED]')) {
        return {
          reply: AI_CONFIG.WARNING_MESSAGE,
          action: 'warned'
        };
      }

      // Truncate if too long
      const finalReply = replyText.length > AI_CONFIG.MAX_RESPONSE_LENGTH
        ? replyText.substring(0, AI_CONFIG.MAX_RESPONSE_LENGTH - 3) + '...'
        : replyText;

      return { reply: finalReply, action: 'replied' };

    } catch (error: any) {
      console.error('[AI Service] OpenAI API error:', error.message || error);
      return { reply: null, action: 'blocked' };
    }
  }

  /**
   * Detect if a message is likely from another bot/automation.
   * Returns true if it seems like an automated message.
   */
  isLikelyBot(messageText: string): boolean {
    const botPatterns = [
      /^(hi|hello|hey)!?\s*(thanks for|thank you for)/i,
      /this is an automated/i,
      /auto[- ]?reply/i,
      /do not reply to this/i,
      /this message was sent automatically/i,
      /powered by \w+bot/i,
      /\[automated message\]/i,
      /noreply/i,
    ];

    return botPatterns.some(pattern => pattern.test(messageText));
  }
}
