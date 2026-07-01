import { readFileSync } from 'fs'
import { join } from 'path'
import { getBotInstance } from '../src/lib/bot'

// Helper to load env variables from .env.local
function loadEnv() {
  try {
    const envPath = join(process.cwd(), '.env.local')
    const envContent = readFileSync(envPath, 'utf-8')
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/)
      if (match) {
        const key = match[1]
        let val = match[2].trim()
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1)
        } else if (val.startsWith("'") && val.endsWith("'")) {
          val = val.substring(1, val.length - 1)
        }
        process.env[key] = val
      }
    })
    console.log('✅ Loaded environment variables from .env.local')
  } catch (error) {
    console.warn('⚠️ Warning: Could not read .env.local. Make sure environment variables are set.')
  }
}

async function main() {
  loadEnv()

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken || botToken === 'your-telegram-bot-token') {
    console.error('❌ Error: TELEGRAM_BOT_TOKEN is not configured in .env.local')
    process.exit(1)
  }

  console.log('🤖 Initializing Telegram bot in polling mode...')
  const bot = getBotInstance()

  // 1. Delete the webhook so Telegram stops routing updates to Vercel and allows long polling
  console.log('🔌 Deleting any active webhook from Telegram...')
  await bot.api.deleteWebhook()
  console.log('✅ Webhook deleted successfully.')

  // 2. Start the bot with long polling
  console.log('🚀 Starting bot via long polling... Send messages to your bot now!')
  bot.start({
    onStart: (botInfo) => {
      console.log(`🤖 Bot @${botInfo.username} is now online and listening for updates locally.`)
    }
  })

  // Handle graceful shutdown
  const shutdown = async () => {
    console.log('\n🛑 Stopping bot polling...')
    await bot.stop()
    console.log('👋 Bot stopped. Exiting.')
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch(err => {
  console.error('❌ Failed to run bot locally:', err)
  process.exit(1)
})
