# Meta Instagram Messaging API – Complete Setup Guide

This document covers **everything** you need to know to create a Meta App that can read and reply to Instagram DMs using AI.

---

## Prerequisites (What You Need Before Starting)

| # | Requirement | Details |
|---|-------------|---------|
| 1 | **Instagram Professional Account** | Must be a **Business** or **Creator** account. Personal accounts will NOT work. |
| 2 | **Facebook Page** | The Instagram account must be **linked** to a Facebook Page that you are an admin of. |
| 3 | **Meta Developer Account** | Register at [developers.facebook.com](https://developers.facebook.com). You need the ability to perform the "Moderate" task on the connected Facebook Page. |
| 4 | **A Registered Meta App** | Create a new app in the Meta Developer Dashboard with the **Facebook Login for Business** use case. |
| 5 | **Privacy Policy URL** | Meta requires a publicly accessible Privacy Policy page for your app. Your AutoMD site already has one! |
| 6 | **HTTPS Webhook Endpoint** | A publicly accessible HTTPS URL on your backend server to receive real-time message notifications from Meta. |

---

## Step-by-Step Setup

### Step 1: Create the Meta App
1. Go to [developers.facebook.com/apps](https://developers.facebook.com/apps).
2. Click **"Create App"**.
3. Select the use case: **"Other"** → then select **"Business"** type.
4. Fill in the App Name (e.g., "AutoMD"), contact email, and optionally link a Business Portfolio.
5. Click **"Create App"**.

### Step 2: Add Instagram Messaging Product
1. In your App Dashboard, go to **"Add Products"**.
2. Find **"Messenger"** (Instagram Messaging is bundled under Messenger) and click **"Set Up"**.
3. This gives you access to the Instagram Messaging API endpoints.

### Step 3: Configure Permissions (OAuth Scopes)
When a user logs in via Facebook Login, your app must request these permissions:

| Permission | Purpose |
|------------|---------|
| `instagram_basic` | Read basic profile info of the connected IG account. |
| `instagram_manage_messages` | **Required.** Read and reply to Instagram DMs. |
| `pages_manage_metadata` | Manage metadata of the connected Facebook Page. |
| `pages_messaging` | Send and receive messages via the Page. |

### Step 4: Set Up Facebook Login
1. In your App Dashboard, go to **"Facebook Login"** → **"Settings"**.
2. Add your **Valid OAuth Redirect URI** (e.g., `https://your-backend.com/auth/facebook/callback`).
3. This is the login flow your users will use. They click "Login with Facebook," grant permissions, and you receive a **Page Access Token** to call the API on their behalf.

### Step 5: Set Up Webhooks
Webhooks allow Meta to send you a real-time notification every time someone DMs the Instagram account.

1. In your App Dashboard, go to **"Webhooks"**.
2. Click **"Add Subscription"** and select the **`instagram`** topic.
3. Provide:
   - **Callback URL:** Your HTTPS backend endpoint (e.g., `https://your-backend.com/api/webhooks/instagram`)
   - **Verify Token:** A secret string that you define (Meta will send this to verify your server).
4. Subscribe to the **`messages`** field.
5. Your backend must respond to Meta's verification GET request with the `hub.challenge` value.

### Step 6: Generate Page Access Token
1. After the user logs in via Facebook Login, exchange the short-lived token for a **long-lived Page Access Token**.
2. This token is what you use to call the `/me/messages` endpoint to send replies.
3. Store this token securely in your database for each connected user.

---

## Development vs. Production

### Development Mode (Testing)
- You can test **immediately** without App Review.
- Only users with a role on your app (Admin, Developer, Tester) can use it.
- You can add up to **25 tester users**.
- Perfect for building and debugging your AI integration.

### Production Mode (Real Users)
- Requires **App Review** from Meta.
- Requires **Business Verification** (uploading official business documents).
- Once approved, **any Instagram Professional account** can connect to your app.
- This is what you need when AutoMD goes live for real customers.

---

## App Review Process

To go live with real users, you must submit your app for review. Here is what Meta requires:

| Requirement | Details |
|-------------|---------|
| **Screencast Video** | Record a video showing exactly how your app uses Instagram messaging (the full user flow from login to sending a reply). |
| **Privacy Policy** | A public URL to your privacy policy (you already have this). |
| **Data Deletion Callback** | A URL where Meta can request deletion of a user's data (you already have this). |
| **Business Verification** | Upload official business documents (business registration, utility bill, etc.) to verify your business identity. |
| **Detailed Use Case** | Write a clear description explaining why your app needs the `instagram_manage_messages` permission. |

**Tips for Approval:**
- Only request the permissions you actually need. Don't ask for extras.
- Make sure your webhook integration is fully working before submitting.
- Provide clear login credentials so Meta's review team can test your app.
- Common rejection reason: The reviewer couldn't log in or test the messaging flow.

---

## API Endpoints You Will Use

| Action | Method | Endpoint |
|--------|--------|----------|
| Get conversations | GET | `/{ig-user-id}/conversations` |
| Get messages in a thread | GET | `/{conversation-id}/messages` |
| Send a reply | POST | `/{ig-user-id}/messages` |
| Get user profile | GET | `/{ig-user-id}` |

**Send Message Payload Example:**
```json
{
  "recipient": {
    "id": "<IGSID>"
  },
  "message": {
    "text": "Hello! Thanks for reaching out. How can I help you today?"
  }
}
```

---

## Key Rules & Restrictions

| Rule | Details |
|------|---------|
| **24-Hour Window** | You can only send messages within 24 hours of the user's last message. |
| **No Cold Outbound** | You cannot send unsolicited messages to users who haven't messaged you first. |
| **Human Handoff** | Must provide a way for users to speak to a real human. |
| **Rate Limits** | Messaging endpoints have their own rate limits. Monitor API response headers. |
| **Professional Accounts Only** | Only Business/Creator IG accounts can use this API. |
| **Facebook Login Required** | Users must authenticate via Facebook Login (not IG username/password). |
| **Disclosure** | Bots should not deceive users into thinking they are talking to a real human. |

---

## Summary

To build AI-powered DM replies into AutoMD, you need:
1. ✅ Create a Meta App at developers.facebook.com
2. ✅ Add Messenger product (includes Instagram Messaging)
3. ✅ Implement Facebook Login to get Page Access Tokens
4. ✅ Set up Webhooks to receive incoming DMs in real time
5. ✅ Use the Send API to reply with your AI-generated response
6. ✅ Submit for App Review when ready to go live
