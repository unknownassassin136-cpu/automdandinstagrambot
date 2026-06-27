/**
 * AI Safety Pre-Filter
 * Runs BEFORE calling Gemini to save API costs and block obvious spam/inappropriate content.
 */

const INAPPROPRIATE_KEYWORDS = [
  // English 18+ keywords
  'sex', 'nude', 'nudes', 'naked', 'porn', 'xxx', 'onlyfans', 'horny', 'boobs',
  'dick', 'pussy', 'fuck', 'fucking', 'blowjob', 'handjob', 'cum', 'orgasm',
  'escort', 'hookup', 'hook up', 'send pics', 'send nudes', 'sexy pics',
  // Hindi 18+ keywords
  'chut', 'lund', 'gaand', 'randi', 'bhosdike', 'madarchod', 'behenchod',
  'chod', 'chudai',
  // Telugu 18+ keywords  
  'dengey', 'modda', 'gudda', 'lanja',
  // Tamil 18+ keywords
  'thevdiya', 'otha', 'sunni', 'pundai',
];

const SPAM_PATTERNS = [
  /(.)\1{8,}/,                         // Repeated characters: "aaaaaaaaaa"
  /^[A-Z\s!]{30,}$/,                   // ALL CAPS SPAM
  /bit\.ly|tinyurl|shorturl/i,         // Shortened URLs (common spam)
  /click here.*win|won.*prize/i,       // Scam phrases
  /earn.*\$.*per.*day/i,               // Money scams
  /investment.*opportunity/i,           // Investment scams
  /crypto.*guaranteed.*returns/i,       // Crypto scams
  /dm me for.*collab/i,                // Spam collab requests
];

export type SafetyResult = 'SAFE' | 'INAPPROPRIATE' | 'SPAM';

export class AiSafety {
  /**
   * Quick safety check on incoming message text.
   * Returns 'SAFE', 'INAPPROPRIATE', or 'SPAM'.
   */
  check(message: string): SafetyResult {
    const lowerMessage = message.toLowerCase().trim();

    // Check for inappropriate/18+ content
    for (const keyword of INAPPROPRIATE_KEYWORDS) {
      // Use word boundary check to avoid false positives
      // e.g., "six" should not match "sex"
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(lowerMessage)) {
        return 'INAPPROPRIATE';
      }
    }

    // Check for spam patterns
    for (const pattern of SPAM_PATTERNS) {
      if (pattern.test(message)) {
        return 'SPAM';
      }
    }

    return 'SAFE';
  }
}
