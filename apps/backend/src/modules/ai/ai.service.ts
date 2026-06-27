import { GoogleGenAI } from '@google/genai';
import { env } from '../../config/env';
import { AI_CONFIG, SYSTEM_PROMPT_TEMPLATE } from './ai.config';
import { AiSafety } from './ai.safety';
import { readFileSync } from 'fs';
import { join } from 'path';

export class AiService {
  private genai: GoogleGenAI;
  private safety: AiSafety;
  private defaultContext: string;

  constructor() {
    this.genai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    this.safety = new AiSafety();

    // Load default business context from file
    try {
      this.defaultContext = readFileSync(
        join(__dirname, 'business-context.md'),
        'utf-8'
      );
    } catch {
      this.defaultContext = 'No business context available.';
    }
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

    // Step 3: Build conversation history for Gemini
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
    
    // Add conversation history (last N messages)
    const recentHistory = conversationHistory.slice(-AI_CONFIG.MAX_CONVERSATION_HISTORY);
    for (const msg of recentHistory) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      });
    }

    // Add the current incoming message
    contents.push({
      role: 'user',
      parts: [{ text: incomingMessage }]
    });

    // Step 4: Call Gemini API
    try {
      const response = await this.genai.models.generateContent({
        model: AI_CONFIG.GEMINI_MODEL,
        contents: contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: AI_CONFIG.TEMPERATURE,
          maxOutputTokens: AI_CONFIG.MAX_OUTPUT_TOKENS,
        }
      });

      const replyText = response.text?.trim() || null;

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
      console.error('[AI Service] Gemini API error:', error.message);
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
