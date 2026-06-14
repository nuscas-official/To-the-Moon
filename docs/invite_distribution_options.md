# Proposal: Invite Link Distribution & Onboarding Strategies

This document presents options for distributing portal registration invite links to new and existing club members, focusing on balancing security, secretary workload, and user privacy.

---

## The Core Problem
To prevent portal abuse, registration is invite-gated. However, manually distributing unique `/join?token=UUID` links to hundreds of members during school registration creates a bottleneck for the executive committee (EXCO).

---

## Option 1: Automated CSV Mailer (Recommended for New Onboarding)
Instead of manually copy-pasting links, the admin dashboard is equipped with a bulk-upload panel.

### Workflow
1. The Secretary exports a list of verified new paid members (names and official university emails) from the registration portal.
2. The Secretary uploads the `.csv` file to `/admin/members/invites` and clicks **"Send Welcomes"**.
3. The server generates unique tokens, sends personalized HTML emails via Resend in a single batch, and immediately discards the university email from memory.

### Evaluation
* **Secretary Workload:** Very Low (takes ~1 minute to upload and send).
* **Security:** High (emails are delivered directly to verified mailboxes).
* **Privacy Compliance (PDPA/GDPR):** Excellent. The database does **not** persist university emails in any table. It only processes them in-memory during dispatch, leaving only the anonymous `token -> generated_by` relationship in the database.

---

## Option 2: Telegram Bot Verification (Self-Service)
A bot in the club's Telegram chat acts as a self-service registration desk.

### Workflow
1. A student messages the Telegram Bot and types `/claim`.
2. The bot verifies if they are already a member of the club's **private group chat** (checking Telegram IDs).
3. If they are in the group, the bot queries the database, generates an invite token, and replies with the registration link.

### Evaluation
* **Workload:** Zero (fully self-service).
* **Security:** Moderate. If someone forwards the private Telegram group invite link to a non-member, they could potentially exploit the bot.
* **Privacy:** Excellent. No university emails or personal identifiers are stored in the database.

---

## Google OAuth & NUS Email Privacy Separation
Since NUS uses Microsoft 365 (`@u.nus.edu`), students' university email accounts are not Google accounts. 
Our registration flow naturally separates verification from account data:
1. **Verification:** The invite token is delivered to the student's official **NUS mailbox**, confirming they are an active student.
2. **Authentication:** The student clicks the link and authenticates using their **personal Google/Gmail account**.
3. **Storage:** The database only stores their personal Gmail address (from Google OAuth). It **never** sees or stores their official `@u.nus.edu` email. This isolates the platform from university database compliance concerns.

---

## Email Template Copy

Here is the template for the automated welcome dispatch:

```markdown
Subject: Welcome to NUSCAS! Set up your Member Portal Account 🌸

Hi {{Member Name}},

Welcome to the NUS Anime Club (NUSCAS) member portal! 

To get started, please set up your account by clicking your unique registration link below:

👉 [Set Up Your Account]({{Join Link}})
(Alternatively, copy and paste this link in your browser: {{Join Link}})

Important Details:
* Expiration: This link is valid for 72 hours. If it expires before you complete registration, you must contact the club secretary to request a new link.
* Google Account Required: You will be redirected to sign in with a Google/Gmail account (this can be your personal Gmail, as we do not store your university email).
* Display Name: You will choose a custom display name during setup, which is how other members will see you on the portal.

If you run into any issues, feel free to reply directly to this email or reach out to us on our Telegram group!

Warm regards,  
NUSCAS Executive Committee 🎨  
nuscas.org
```

---

## Handling Existing Members (Legacy Transition)

Existing members (who were active before the portal was introduced) need to be onboarded. Since Option 1 is tailored for new registrations, here are two paths for legacy members:

### Path A: Private Telegram Channel Seeding (Recommended)
1. The Admin generates a batch of invite links (e.g. 50 tokens) in `/admin/members/invites`.
2. The Admin exports these links and posts them inside a pinned message in the club's **Private Member Telegram Group**.
3. Existing members scan the list, click a pending link, and sign up. Once clicked, the link is instantly marked as `Used`, preventing other members from claiming it.
* **Why it works:** Highly secure because only verified legacy members have access to the private group chat. No email storage required.

### Path B: Administrative On-Demand Generation
1. Existing members message an EXCO member when they want to log in.
2. The Admin goes to `/admin/members/invites`, clicks **Generate Invite Link**, and DMs it to the member.
* **Why it works:** Good for mid-semester onboarding of single legacy members.

---

## Summary Table for EXCO Discussion

| Metric | Option 1: CSV Mailer | Option 2: Telegram Bot | Path A: Telegram Seeding (Existing) |
| :--- | :--- | :--- | :--- |
| **Setup Effort** | Low (uses Resend) | Moderate (requires Telegram Bot integration) | Zero (uses existing admin UI) |
| **Secretary Workload** | 1 min / semester | 0 min | 5 mins / semester |
| **User Friction** | Zero (one-click from email) | Low (must text bot) | Low (grabs a link from pinned list) |
| **Privacy (No NUS Email)** | Yes (stateless dispatch, never stored) | Yes (uses Telegram IDs only) | Yes (does not touch emails at all) |
| **Abuse Security** | High | Moderate (dependent on group privacy) | High (restricted to private group) |
