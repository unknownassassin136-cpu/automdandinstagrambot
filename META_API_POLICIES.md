# Meta API Policies for AI Automated Replies

Meta (Facebook, Instagram, WhatsApp) **DOES allow** the use of AI to automate replies to Direct Messages (DMs), but they have strict policies governed by **Meta’s Developer Policies** and **Platform Terms**.

Here is a comprehensive breakdown of the rules for implementing AI automation on Meta platforms:

## 1. You Must Use the Official API
**Strictly Prohibited:** You cannot use unauthorized "bot" tools that scrape data, simulate human behavior, or ask for your Instagram username and password. 

You must integrate your AI exclusively through the **Official Instagram Messaging API** (which is part of the Meta Graph API). This is the only authorized way to send automated messages. Your app must be formally reviewed and granted the `instagram_manage_messages` permission by Meta.

## 2. Authentication & Account Eligibility
- **Facebook Login Requirement:** API calls require a Page Access Token (PAT). To get this, your users *must* authenticate using the **Facebook Login** flow. A simple Instagram username/password login is strictly prohibited and technically impossible for the official API.
- **Account Type:** Automated AI replies are only allowed for **Instagram Professional accounts (Business or Creator)**. Standard personal accounts cannot use the official API for automation. 
- **Page Link:** The Instagram Professional account must be linked to a Facebook Page that the user administers.

## 3. The 24-Hour Messaging Window (Standard Messaging)
**The 24-Hour Rule:** This is Meta's most strictly enforced policy across Messenger, Instagram, and WhatsApp.

You can only send automated messages (including promotional content) to a user **within 24 hours of their last message to you**. 
- If a user sends a DM, your AI has 24 hours to converse with them.
- If the 24 hours expire, the API will block further standard messages until the user messages you again. 
- You cannot send unsolicited "cold" outbound messages to users who haven't interacted with you first.

## 4. Message Tags (Outside the 24-Hour Window)
If you need to message a user after the 24-hour window, you can only do so using specific, approved **Message Tags** for non-promotional, 1:1 updates. 
- *Example:* The **Human Agent tag** allows for manual (human) responses to user messages within a 7-day period, allowing customer service reps to follow up on complex issues that take longer than 24 hours to resolve.

## 5. User-Initiated Triggers
Automation must be triggered by an action taken by the user. Valid triggers include:
- A direct message sent to your inbox.
- A comment left on one of your posts or Reels.
- A reply or reaction to your Instagram Story.

## 6. Human Escalation (Handoff)
Meta requires that users have a way to escape the AI loop and talk to a real person.

Your AI workflow must include a seamless "human handoff" protocol. If the AI cannot understand the user, or if the user explicitly asks to speak to a human, the bot must pause the automation and notify a human agent to take over the conversation in the inbox.

## 7. Disclosure
You should be transparent that the user is talking to an automated system. While you don't always have to say "I am an AI," deceptive practices where a bot pretends to be a real human and tricks the user are against Meta's community standards.

## Summary
If we build the AI integration using the official Graph API with proper Facebook Login authentication, respect the 24-hour window, and ensure there is a way for a human to take over the chat, Meta fully supports and allows AI automated replies!
