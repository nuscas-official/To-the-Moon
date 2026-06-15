import { getBotInstance } from '@/lib/bot'
import { NextResponse } from 'next/server'

// Disable caching for the webhook endpoint
export const revalidate = 0
export const dynamic = 'force-dynamic'

/**
 * POST endpoint called by Telegram's webhook system.
 * Validates the secret token header and processes the update.
 */
export async function POST(request: Request) {
  // 1. Validate Secret Token Header
  const secretHeader = request.headers.get('X-Telegram-Bot-Api-Secret-Token')
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET

  if (!webhookSecret || secretHeader !== webhookSecret) {
    console.warn('Unauthorized webhook request rejected: secret token mismatch.')
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    )
  }

  try {
    // 2. Parse and handle update
    const update = await request.json()
    const bot = getBotInstance()

    // Initialize bot info (fetches bot username/details from Telegram) if not already cached
    if (!bot.botInfo) {
      await bot.init()
    }
    
    // We must await update handling in serverless environments to prevent early termination
    await bot.handleUpdate(update)
  } catch (err) {
    console.error('Error processing Telegram update via webhook:', err)
    // Return a 200 response anyway so Telegram doesn't retry endlessly and flood the server
  }

  // 3. Return 200 immediately
  return NextResponse.json({ ok: true })
}
