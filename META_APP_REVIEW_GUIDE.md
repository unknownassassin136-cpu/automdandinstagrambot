# Meta App Review Guidelines & Screencast Instructions

This document provides the necessary instructions and script to successfully pass the Meta App Review process for the `instagram_business_basic`, `instagram_business_manage_messages`, and `instagram_business_manage_comments` permissions.

## 1. Submission Notes
Meta reviewers often mistake automation apps for manual inbox/CRM tools, leading to rejections because they don't see a manual "Send" button. You **must** include the following text in your review notes for all requested permissions:

> **Reviewer Note:** Please note that this is an **Automation App**, not a manual inbox. Users do not manually click "send" for each message. Instead, the user configures an "Automation Rule" in our app's UI. When an Instagram user comments on a post with a specific keyword, our server automatically sends the Comment Reply and Direct Message via the Meta API in the background. My screencast demonstrates the configuration of the rule in our UI, followed by the automated response occurring live in the native Instagram client.

---

## 2. Screencast Video Script
You must record one continuous video (or cleanly edit clips together) demonstrating the entire end-to-end flow. Provide text captions or an English voiceover explaining what you are doing in each step.

### Step 1: The Meta Login Flow (Crucial)
1. Start on the app's dashboard or settings page.
2. Click the button to "Connect Instagram Account".
3. **Show the Facebook popup window appearing.**
4. Go through the Facebook login steps. Make sure the screen where Facebook lists the requested permissions (e.g., "Manage comments", "Manage messages") is clearly visible.
5. Finish the login and show the account successfully appearing in your app.

### Step 2: App Configuration ("The Send Action")
1. Navigate to the "Automations" page in the app.
2. Click "Create Rule".
3. Fill out the rule: Set a keyword (e.g., "TEST"), write a Comment Reply, and write a DM Template.
4. Explain (via caption or voice): *"Here the user configures the automated send action."*
5. Click **Publish** and show the rule appearing in the list as active.

### Step 3: The Native Experience (The Proof)
1. Open up **Instagram.com** in a new browser tab (or show a screen recording of a phone).
2. Log into a *different* test Instagram account.
3. Go to the business page connected in Step 1.
4. Type the keyword ("TEST") on one of the posts and hit enter.
5. Wait a few seconds.
6. **Show the Comment Reply appearing** under the post natively.
7. **Open the Instagram Direct Messages (Inbox)** and show the automated DM that was successfully delivered.
