# ADR-006: Run Telegram Bot as a Webhook inside Next.js using Grammy.js

**Date:** June 2026  
**Status:** Accepted

## Decision
We will implement the NUSCAS Telegram bot as a Next.js API route handler (`/api/telegram/webhook`) running Grammy.js in webhook mode, rather than running a separate, long-running polling service. Account pairing will be handled via transient, single-use 6-character alphanumeric codes generated on the client settings page and stored in the `telegram_link_codes` database table.

## Reason
1. **Serverless & Monorepo Cohesion**: Running the bot as a webhook inside Next.js matches our project constraint of a single repository without separate backend services. It eliminates the cost and maintenance overhead of hosting a separate long-running container (like Docker/PM2) for long-polling.
2. **Secure Admin Operations**: The Telegram webhook endpoint operates anonymously relative to Next.js cookie sessions. However, the handler uses the Supabase Service Role client (`createAdminClient()`) to verify codes and update profiles securely on the server.
3. **Transient Linking Security**: Using 6-character alphanumeric codes with a 10-minute expiration prevents brute-force claims while ensuring that a user must actively log into the portal to authorize linking a Telegram account.
4. **Simple Conversational State**: For the rating flows, Grammy's built-in session middleware is used. Because conversation steps (search, select, score) occur in rapid succession, a simple in-memory session store is used for the prototype.

## Alternatives Considered
- **Long-Polling Daemon**: Running a script on a VPS that calls `bot.start()` to pull updates. Rejected due to infrastructure complexity and cost on a hobby budget.
- **Telegram Login Widget**: Placing Telegram's authentication widget on the website. Rejected because it requires configuring domain settings in Telegram, does not authenticate the bot conversation automatically, and does not allow users to perform ratings from within the Telegram app.
- **Persistent DB Sessions**: Storing the bot's conversation sessions inside Supabase. Rejected for the prototype to avoid database write amplification for partial/aborted commands, but remains the recommended path for production scaling.

## Consequences
- The `/api/telegram/webhook` endpoint must remain public (bypassing middleware redirects).
- To prevent unauthorized calls to the webhook, a secret token header (`X-Telegram-Bot-Api-Secret-Token`) must be validated against `TELEGRAM_WEBHOOK_SECRET` on every request.
- The Grammy bot instance must be lazily initialized to prevent compilation and build-time errors when environment variables like `TELEGRAM_BOT_TOKEN` are absent in local or CI environments.

## Production Scaling: Persistent Sessions
For production deployment, relying on the default in-memory session store is **not recommended** because:
1. **Serverless Instance Recycling**: Vercel recycles serverless containers frequently. Any in-progress rating flow (e.g., waiting for the user to select a rating score) will be lost if the container spins down.
2. **Horizontal Scaling**: Multiple concurrent requests may be routed to different serverless containers, making memory sharing impossible.

### Layman's Explanation
* **In-Memory (Mental Notes)**: The bot remembers your active conversation (like selecting an anime to rate) by keeping it in the server's temporary memory. If the server goes to sleep (which Vercel does constantly when there is no traffic), the bot "forgets" what you were doing.
* **Persistent Database (The Order Ticket)**: The bot writes your conversation state onto a central database ticket (Supabase). Even if the server shuts down, restarts, or a different server handles your next message, the server reads the ticket and resumes the conversation where you left off.
* **Horizontal Scaling (Multiple Baristas)**: If many users talk to the bot at once, Vercel starts up multiple copies of the server to handle the load. With in-memory sessions, Server Copy B cannot read Server Copy A's mind. A database lets all copies look at the same "order tickets" to share progress.

### User Experience (UX) Impact
- **In-Memory (Time Expired)**: If a member initiates a `/rate` flow but gets distracted and waits more than a few minutes before tapping a button, the server will sleep. When they finally tap the button, the bot will fail with a *"Session expired. Please start over with /rate."* error.
- **In-Memory (Busy Server / Random Failure)**: During peak usage (e.g., a club meeting), Vercel automatically spins up multiple copies of the server. A user's messages might be routed to different copies. This causes the bot to randomly forget their active search, throwing *"Session expired"* errors even if the user replies instantly. The bot feels buggy and unpredictable.
- **Persistent Database**: Members can pause their conversation indefinitely, and multiple concurrent users never experience state conflicts or random session drops.

### Recommended Implementation
To upgrade the bot to use persistent database sessions:
1. Create a `telegram_sessions` table in Supabase:
   ```sql
   create table public.telegram_sessions (
     key text primary key,
     value text not null
   );
   alter table public.telegram_sessions enable row level security;
   ```
2. Install the Grammy Supabase storage adapter: `npm install @grammyjs/storage-supabase`
3. Modify `src/lib/bot.ts` to initialize sessions using the storage adapter:
   ```typescript
   import { supabaseAdapter } from '@grammyjs/storage-supabase'
   // ...
   botInstance.use(session({
     storage: supabaseAdapter({
       supabase: createAdminClient(),
       table: 'telegram_sessions',
     }),
     initial: () => ({})
   }))
   ```
