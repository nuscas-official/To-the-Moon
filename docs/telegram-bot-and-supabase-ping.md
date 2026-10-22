# Telegram Bot Testing & Supabase Inactivity Workaround Documentation

This document outlines the testing checklist for verifying the Telegram bot before production deployment, and details the plan for the Supabase free-tier inactivity workaround (to be implemented later).

---

## Part 1: Pre-Deployment Telegram Bot Testing Checklist

Perform these tests on a staging deployment (or locally using `ngrok`) to guarantee bot stability, security, and correct database interaction.

### 1. Verification of Unlinked / Deactivated Users (Access Control)
* [ ] **Test Any Message**: Send a random text message (e.g., "Hello") to the bot before linking.
  * *Expected Result*: The bot should intercept the message and reply with instructions on how to link their portal account.
* [ ] **Test Protected Commands**: Send `/nominate`, `/vote`, or `/unlink` before linking.
  * *Expected Result*: The bot should reject the command and output the same account-linking guide.
* [ ] **Test Deactivated Member**: Link an account, deactivate that member in the website Admin panel (set `is_active = false`), then send any message to the bot.
  * *Expected Result*: The bot should detect the deactivated status and reject the input.

### 2. Verification of Account Linking (/link & /start)
* [ ] **Test Empty Code**: Send `/link` with no arguments.
  * *Expected Result*: The bot should request a 6-character code and show an example.
* [ ] **Test Invalid Code**: Send `/link WRONG1`.
  * *Expected Result*: The bot should reply with an "Invalid code" error.
* [ ] **Test Expired Code**: Generate a code on the portal settings page, wait 10 minutes for it to expire, then send `/link <EXPIRED_CODE>`.
  * *Expected Result*: The bot should reply stating the code has expired and ask you to generate a new one.
* [ ] **Test Reuse of Code**: Link an account successfully using a code, then try to send the exact same code again (or use it from another Telegram account).
  * *Expected Result*: The bot should reply stating that the code has already been used.
* [ ] **Test Deep Linking (`/start` Parameter)**: Click the "Send to Bot" button on the settings page which opens the Telegram link `t.me/bot?start=CODE`. Tap **Start** in Telegram.
  * *Expected Result*: The bot should automatically read the code from the start parameter, perform the link, and welcome the member by their display name.
* [ ] **Test Duplicate Linkage**: Try to link a Telegram account that is already linked to another member profile.
  * *Expected Result*: The bot should reject the link and ask the user to unlink the first profile.

### 3. Verification of Core Commands
* [ ] **Test `/help`**: Send `/help`.
  * *Expected Result*: The bot outputs the list of commands and brief usage.
* [ ] **Test `/nominate` (Anime of the Season)**:
  1. Send `/nominate` (or `/nominate Frieren` to skip the prompt).
  2. Enter a search query. Verify the bot shows a loading indicator, then up to 5 anime (no manga) as inline buttons labelled with their airing season.
  3. Tap one. Verify the bot confirms the nomination and says your vote is on it.
  4. Nominate the same title from a second linked account. Verify no duplicate nominee is created; the second account's vote just moves to it.
  5. Reload the homepage. Verify the hero's seasonal card shows the leader with its vote count (unless a pick is pinned in Admin → Settings).
* [ ] **Test `/vote`**: Send `/vote`.
  * *Expected Result*: One button per nominee with vote counts, your current vote marked ✅. Tapping another title moves your vote and refreshes the counts in place.
* [ ] **Test `/season`** in both a DM and a group chat.
  * *Expected Result*: The top 5 nominees for the current season with vote counts.
* [ ] **Test `/unlink`**: Send `/unlink`.
  * *Expected Result*: The bot confirms the unlinking. Verify that the settings page on the website updates to show "Not Connected" and the `telegram_id` column in the database is set to `NULL`.

---

## Part 2: Supabase Inactivity Workaround (Implemented)

### The Problem
Supabase automatically **pauses free-tier databases** after 1 week of inactivity (i.e., if no read/write connections occur). During university semester breaks, this can cause the NUSCAS website to appear offline when members return.

### The Workaround Strategy
To keep the database awake indefinitely, we have implemented a **GitHub Actions scheduled cron job** that calls our site's health endpoint once a week. 

### Why a standard `/api/health` call fails
If the health endpoint simply returns `NextResponse.json({ status: 'ok' })`, **Supabase will still pause**. The serverless function must actively execute a query to trigger database traffic.

### Implementation Blueprint

#### 1. Next.js API Route Update (`src/app/api/health/route.ts`)
We have rewritten the health handler to query the database:
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const supabase = createClient()
  
  // Optional security: Check a header secret to prevent public database spamming
  const clientSecret = request.headers.get('X-Health-Check-Key')
  const serverSecret = process.env.HEALTH_CHECK_SECRET
  if (serverSecret && clientSecret !== serverSecret) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Execute a lightweight read query to register activity on Supabase
  const { data, error } = await supabase
    .from('site_config')
    .select('key')
    .limit(1)

  if (error) {
    console.error('Health connection check failed:', error)
    return NextResponse.json({ status: 'error', error: error.message }, { status: 500 })
  }

  return NextResponse.json({ status: 'ok', database: 'connected' })
}
```

#### 2. GitHub Actions Workflow (`.github/workflows/ping-db.yml`)
We have created a GitHub Action file scheduled to run weekly:
```yaml
name: Ping Database (Prevent Free Tier Pause)

on:
  schedule:
    - cron: '0 9 * * 1' # Runs every Monday at 9:00 AM UTC (5:00 PM SG time)
  workflow_dispatch:     # Allows manual triggering via GitHub Actions UI

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Health Endpoint
        run: |
          curl -f \
            -H "X-Health-Check-Key: ${{ secrets.HEALTH_CHECK_SECRET }}" \
            "https://www.nuscas.com/api/health"
```

### Local Verification

To verify that the health check endpoint and the database connectivity check are working correctly, you can run the local health test script:

```bash
node scripts/test-health.mjs
```

This script will:
1. Load `HEALTH_CHECK_SECRET` from `.env.local`.
2. Start a local Next.js development server.
3. Ping `/api/health` without a secret (asserting it gets blocked with a `401`).
4. Ping `/api/health` with a wrong secret (asserting it gets blocked with a `401`).
5. Ping `/api/health` with the correct secret (asserting it succeeds with a `200` and verifies active Supabase connection).
6. Gracefully shut down the development server.

