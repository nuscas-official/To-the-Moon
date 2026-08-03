import { Bot, Context, session, SessionFlavor } from 'grammy'
import { createAdminClient } from '@/lib/supabase/admin'

export interface SessionData {
  step?: 'awaiting_search_query' | 'awaiting_title_selection' | 'awaiting_score';
  results?: {
    id: number;
    title_en: string;
    cover_image_url: string | null;
    media_type: 'anime' | 'manga' | 'other';
  }[];
  selectedMedia?: {
    id: number;
    title_en: string;
    cover_image_url: string | null;
    media_type: 'anime' | 'manga' | 'other';
  };
}

export interface UserProfile {
  id: string;
  display_name: string;
  is_active: boolean;
  telegram_id: number | null;
  role: string;
}

export type BotContext = Context & SessionFlavor<SessionData> & {
  userProfile?: UserProfile;
}

let botInstance: Bot<BotContext> | null = null

export function getBotInstance(): Bot<BotContext> {
  if (botInstance) return botInstance

  // Use dummy token during build or local setup if real token is not available
  const token = process.env.TELEGRAM_BOT_TOKEN || '123456789:dummy-token-placeholder'
  botInstance = new Bot<BotContext>(token)

  // 1. Session Middleware (In-memory storage)
  botInstance.use(session({
    initial: (): SessionData => ({})
  }))

  // 2. Auth Middleware
  // Protects all commands/messages by verifying telegram_id, except for linking commands
  const GROUP_ALLOWED_COMMANDS = ['/trending', '/events', '/help']

  botInstance.use(async (ctx, next) => {
    // In group/supergroup chats, skip auth and only allow a small set of
    // read-only commands. Everything else (linking, rating, session state)
    // remains private-chat only.
    if (ctx.chat?.type !== 'private') {
      const messageText = (ctx.message?.text || '').trim()
      const isAllowedGroupCommand = GROUP_ALLOWED_COMMANDS.some(cmd =>
        messageText === cmd || messageText.startsWith(`${cmd}@`)
      )
      if (isAllowedGroupCommand) return await next()
      return
    }

    const telegramId = ctx.from?.id
    if (!telegramId) return

    const messageText = (ctx.message?.text || '').trim()
    const isBypassCommand = 
      messageText.startsWith('/link') || 
      messageText.startsWith('/start') || 
      messageText.startsWith('/whoami')

    const adminSupabase = createAdminClient()

    // Query DB for user with this telegram_id
    const { data: userProfile, error } = await adminSupabase
      .from('users')
      .select('id, display_name, is_active, telegram_id, role')
      .eq('telegram_id', telegramId)
      .maybeSingle()

    if (error) {
      console.error('Error looking up telegram_id in auth middleware:', error)
      await ctx.reply('An error occurred checking account linking status. Please try again.')
      return
    }

    // If no active member profile is linked to this telegram_id
    if (!userProfile || !userProfile.is_active) {
      if (isBypassCommand) {
        // Let user link their account or check connection status
        return await next()
      } else {
        await ctx.reply(
          `🔒 *NUSCAS Member Portal*\n\n` +
          `Your Telegram account is not linked to an active NUSCAS profile.\n\n` +
          `To link your account:\n` +
          `1. Log in to the NUSCAS Member Portal.\n` +
          `2. Go to Member Area → Settings.\n` +
          `3. Click "Link Telegram" to generate a code.\n` +
          `4. Send \`/link <your_code>\` here.`,
          { parse_mode: 'Markdown' }
        )
        return
      }
    }

    // Attach profile to context state for subsequent handlers
    ctx.userProfile = userProfile
    return await next()
  })

  // 3. Command: /start
  botInstance.command('start', async (ctx) => {
    const param = (ctx.match || '').trim()
    if (param) {
      // Treat as /link command
      await handleLink(ctx, param)
    } else {
      await ctx.reply(
        `👋 *Welcome to the NUSCAS Member Bot!*\n\n` +
        `To the Moon is the NUS Comics and Animation Socity member portal bot. You can search, rate anime/manga, and view your reviews.\n\n` +
        `Use these commands:\n` +
        `/rate — Search and rate an anime or manga\n` +
        `/myratings — View your 5 most recent ratings\n` +
        `/trending — View the top 5 highest-rated titles\n` +
        `/events — View upcoming club events\n` +
        `/whoami — Show your profile and link status\n` +
        `/unlink — Unlink your Telegram account\n` +
        `/help — Show all commands`,
        { parse_mode: 'Markdown' }
      )
    }
  })

  // 4. Command: /link <CODE>
  botInstance.command('link', async (ctx) => {
    const code = (ctx.match || '').trim()
    await handleLink(ctx, code)
  })

  // 5. Command: /unlink
  botInstance.command('unlink', async (ctx) => {
    const userProfile = ctx.userProfile
    if (!userProfile) {
      await ctx.reply('Your Telegram account is not linked to any profile.')
      return
    }

    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase
      .from('users')
      .update({ telegram_id: null })
      .eq('id', userProfile.id)

    if (error) {
      console.error('Error during Telegram unlinking:', error)
      await ctx.reply('Failed to unlink your account. Please try again.')
      return
    }

    // Invalidate codes too
    await adminSupabase
      .from('telegram_link_codes')
      .delete()
      .eq('user_id', userProfile.id)

    await ctx.reply('✅ Your Telegram account has been successfully unlinked from your NUSCAS profile.')
  })

  // 6. Command: /myratings
  botInstance.command('myratings', async (ctx) => {
    const userProfile = ctx.userProfile
    if (!userProfile) {
      await ctx.reply('Please link your Telegram account first using /link.')
      return
    }

    const adminSupabase = createAdminClient()
    const { data: ratings, error } = await adminSupabase
      .from('ratings')
      .select('title_en, score, media_type')
      .eq('user_id', userProfile.id)
      .order('updated_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Error fetching ratings in bot:', error)
      await ctx.reply('An error occurred fetching your ratings.')
      return
    }

    if (!ratings || ratings.length === 0) {
      await ctx.reply('You have not rated any titles yet. Use /rate to add a rating!')
      return
    }

    let text = '⭐ *Your 5 Most Recent Ratings:*\n\n'
    ratings.forEach((r, idx) => {
      const typeIcon = r.media_type === 'anime' ? '📺' : '📖'
      text += `${idx + 1}. ${typeIcon} *${r.title_en}* — *${r.score}/10*\n`
    })

    await ctx.reply(text, { parse_mode: 'Markdown' })
  })

  // 7. Command: /rate
  botInstance.command('rate', async (ctx) => {
    const session = ctx.session
    session.step = 'awaiting_search_query'
    session.results = undefined
    session.selectedMedia = undefined
    await ctx.reply('📺 *Rate Anime & Manga*\n\nPlease enter the title you want to search on AniList:', { parse_mode: 'Markdown' })
  })

  // 8. Command: /help
  botInstance.command('help', async (ctx) => {
    await ctx.reply(
      `🤖 *NUSCAS Bot Commands:*\n\n` +
      `/rate — Search and submit a score for a title\n` +
      `/myratings — Show your 5 most recent ratings\n` +
      `/trending — Show the top 5 highest-rated titles\n` +
      `/events — Show upcoming club events\n` +
      `/whoami — Show your profile and link status\n` +
      `/unlink — Unlink your Telegram account from the portal\n` +
      `/help — Show this menu\n\n` +
      `*Linking commands:*\n` +
      `/link <CODE> — Link account using settings page code`,
      { parse_mode: 'Markdown' }
    )
  })

  // Command: /trending
  botInstance.command('trending', async (ctx) => {
    const adminSupabase = createAdminClient()
    const { data: trending, error } = await adminSupabase
      .from('public_rating_aggregates')
      .select('title_en, average_score, media_type, rating_count')
      .order('average_score', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Error fetching trending ratings in bot:', error)
      await ctx.reply('An error occurred fetching trending titles.')
      return
    }

    if (!trending || trending.length === 0) {
      await ctx.reply('📈 No trending titles with sufficient reviews found yet.')
      return
    }

    let text = '📈 *Top 5 Highest-Rated Titles:*\n\n'
    trending.forEach((t, idx) => {
      const typeIcon = t.media_type === 'anime' ? '📺' : '📖'
      text += `${idx + 1}. ${typeIcon} *${t.title_en}* — *${t.average_score}/10* (${t.rating_count} ratings)\n`
    })

    await ctx.reply(text, { parse_mode: 'Markdown' })
  })

  // Command: /events
  botInstance.command('events', async (ctx) => {
    const adminSupabase = createAdminClient()
    const { data: events, error } = await adminSupabase
      .from('events')
      .select('title, starts_at, location, description')
      .eq('status', 'upcoming')
      .gte('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: true })
      .limit(3)

    if (error) {
      console.error('Error fetching events in bot:', error)
      await ctx.reply('An error occurred fetching upcoming events.')
      return
    }

    if (!events || events.length === 0) {
      await ctx.reply('📅 No upcoming events scheduled at the moment.')
      return
    }

    let text = '📅 *Upcoming NUSCAS Events:*\n\n'
    events.forEach((event) => {
      const dateStr = new Date(event.starts_at).toLocaleDateString('en-SG', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Singapore'
      })
      text += `🔹 *${event.title}*\n`
      text += `⏰ ${dateStr}\n`
      if (event.location) {
        text += `📍 ${event.location}\n`
      }
      if (event.description) {
        text += `📝 _${event.description.length > 100 ? event.description.substring(0, 100) + '...' : event.description}_\n`
      }
      text += '\n'
    })

    await ctx.reply(text, { parse_mode: 'Markdown' })
  })

  // Command: /whoami
  botInstance.command('whoami', async (ctx) => {
    const telegramId = ctx.from?.id
    const userProfile = ctx.userProfile

    if (userProfile) {
      await ctx.reply(
        `👤 *NUSCAS Profile Info*\n\n` +
        `• *Display Name:* ${userProfile.display_name}\n` +
        `• *Role:* ${userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}\n` +
        `• *Telegram ID:* \`${telegramId}\`\n` +
        `• *Status:* 🔗 Linked`,
        { parse_mode: 'Markdown' }
      )
    } else {
      await ctx.reply(
        `👤 *Telegram ID:* \`${telegramId}\`\n` +
        `• *Status:* ❌ Unlinked to any NUSCAS profile.\n\n` +
        `Use \`/link <CODE>\` to pair your account.`,
        { parse_mode: 'Markdown' }
      )
    }
  })

  // 9. Callback Query Handler (for keyboard button clicks)
  botInstance.on('callback_query:data', async (ctx) => {
    const data = ctx.callbackQuery.data
    const session = ctx.session

    if (data.startsWith('select_')) {
      if (session.step !== 'awaiting_title_selection' || !session.results) {
        await ctx.answerCallbackQuery({ text: 'Session expired.' })
        await ctx.reply('⚠️ Session expired. Please start over with /rate.')
        return
      }

      const index = parseInt(data.split('_')[1], 10)
      if (isNaN(index) || index < 0 || index >= session.results.length) {
        await ctx.answerCallbackQuery({ text: 'Invalid selection.' })
        return
      }

      const selected = session.results[index]
      session.selectedMedia = selected
      session.step = 'awaiting_score'

      const keyboard = {
        inline_keyboard: [
          [
            { text: '1 ⭐', callback_data: 'score_1' },
            { text: '2 ⭐', callback_data: 'score_2' },
            { text: '3 ⭐', callback_data: 'score_3' },
            { text: '4 ⭐', callback_data: 'score_4' },
            { text: '5 ⭐', callback_data: 'score_5' }
          ],
          [
            { text: '6 ⭐', callback_data: 'score_6' },
            { text: '7 ⭐', callback_data: 'score_7' },
            { text: '8 ⭐', callback_data: 'score_8' },
            { text: '9 ⭐', callback_data: 'score_9' },
            { text: '10 🌟', callback_data: 'score_10' }
          ]
        ]
      }

      await ctx.answerCallbackQuery()
      await ctx.editMessageText(
        `Selected: *${selected.title_en}* (${selected.media_type === 'anime' ? 'Anime' : 'Manga'})\n\n` +
        `Rate this title on a scale of 1 to 10:`,
        { parse_mode: 'Markdown', reply_markup: keyboard }
      )
    } else if (data.startsWith('score_')) {
      if (session.step !== 'awaiting_score' || !session.selectedMedia) {
        await ctx.answerCallbackQuery({ text: 'Session expired.' })
        await ctx.reply('⚠️ Session expired. Please start over with /rate.')
        return
      }

      const score = parseInt(data.split('_')[1], 10)
      if (isNaN(score) || score < 1 || score > 10) {
        await ctx.answerCallbackQuery({ text: 'Invalid score.' })
        return
      }

      const media = session.selectedMedia
      const userProfile = ctx.userProfile

      if (!userProfile) {
        await ctx.answerCallbackQuery({ text: 'User auth missing.' })
        return
      }

      const adminSupabase = createAdminClient()

      // Insert or update rating (unique user_id and anilist_id)
      const { error } = await adminSupabase
        .from('ratings')
        .upsert({
          user_id: userProfile.id,
          anilist_id: media.id,
          media_type: media.media_type,
          title_en: media.title_en,
          cover_image_url: media.cover_image_url,
          score,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,anilist_id'
        })

      if (error) {
        console.error('Error saving rating via Telegram bot:', error)
        await ctx.answerCallbackQuery({ text: 'Error saving rating.' })
        await ctx.reply('❌ Failed to save your rating. Please try again.')
        return
      }

      await ctx.answerCallbackQuery({ text: 'Rating saved!' })
      await ctx.editMessageText(
        `✅ Rating recorded!\n\n` +
        `*${media.title_en}* (${media.media_type === 'anime' ? 'Anime' : 'Manga'})\n` +
        `Your rating: *${score}/10* 🌟`,
        { parse_mode: 'Markdown' }
      )

      // Clear rating session state
      session.step = undefined
      session.results = undefined
      session.selectedMedia = undefined
    }
  })

  // 10. Message handler for text entry (search query)
  botInstance.on('message:text', async (ctx) => {
    const session = ctx.session

    if (session.step === 'awaiting_search_query') {
      const query = ctx.message.text.trim()
      if (!query) {
        await ctx.reply('Please enter a valid search term:')
        return
      }

      const loadingMsg = await ctx.reply('🔍 Searching AniList...')

      try {
        const { searchAniList } = await import('@/lib/anilist')
        const results = await searchAniList(query)

        if (!results || results.length === 0) {
          await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id)
          await ctx.reply('❌ No results found. Please try searching for another title:')
          return
        }

        // Keep top 3 results, format media type
        const top3 = results.slice(0, 3).map(item => ({
          id: item.id,
          title_en: item.title.english || item.title.romaji || 'Unknown Title',
          cover_image_url: item.coverImage.medium,
          media_type: item.type === 'MANGA' ? ('manga' as const) : ('anime' as const)
        }))

        session.results = top3
        session.step = 'awaiting_title_selection'

        const inlineKeyboard = {
          inline_keyboard: top3.map((item, idx) => [
            {
              text: `${idx + 1}. ${item.title_en} (${item.media_type === 'anime' ? 'Anime' : 'Manga'})`,
              callback_data: `select_${idx}`
            }
          ])
        }

        await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id)
        await ctx.reply('Select the correct entry below:', {
          reply_markup: inlineKeyboard
        })
      } catch (err) {
        console.error('Error during search query in bot:', err)
        await ctx.api.deleteMessage(ctx.chat.id, loadingMsg.message_id)
        await ctx.reply('An error occurred searching AniList. Please try again.')
      }
    } else {
      const userProfile = ctx.userProfile
      if (userProfile) {
        await ctx.reply(
          `Hello, *${userProfile.display_name}*!\n\n` +
          `Use /rate to search and rate a title, or /help to see all available commands.`,
          { parse_mode: 'Markdown' }
        )
      }
    }
  })

  return botInstance
}

/**
 * Common helper to handle /link command execution
 */
async function handleLink(ctx: BotContext, codeParam: string) {
  const userProfile = ctx.userProfile
  if (userProfile) {
    await ctx.reply(`Already linked to member account: *${userProfile.display_name}*.`, { parse_mode: 'Markdown' })
    return
  }

  const code = codeParam.trim().toUpperCase()
  if (!code) {
    await ctx.reply('⚠️ Please provide the 6-character linking code.\nExample: `/link ABC123`', { parse_mode: 'Markdown' })
    return
  }

  const adminSupabase = createAdminClient()

  // 1. Fetch code row
  const { data: linkCode, error: fetchError } = await adminSupabase
    .from('telegram_link_codes')
    .select('*')
    .eq('code', code)
    .maybeSingle()

  if (fetchError) {
    console.error('Error fetching link code:', fetchError)
    await ctx.reply('An error occurred. Please try again.')
    return
  }

  if (!linkCode) {
    await ctx.reply('❌ Invalid linking code. Please check and try again.')
    return
  }

  if (linkCode.used) {
    await ctx.reply('❌ This code has already been used. Please generate a new one.')
    return
  }

  const expiresAt = new Date(linkCode.expires_at)
  if (expiresAt < new Date()) {
    await ctx.reply('❌ This code has expired. Please generate a new code in your settings page.')
    return
  }

  const telegramId = ctx.from?.id
  if (!telegramId) {
    await ctx.reply('Could not retrieve your Telegram ID.')
    return
  }

  // 2. Check if Telegram account is already linked to another member profile
  const { data: duplicateUser } = await adminSupabase
    .from('users')
    .select('id, display_name')
    .eq('telegram_id', telegramId)
    .maybeSingle()

  if (duplicateUser) {
    await ctx.reply(`❌ This Telegram account is already linked to another member profile (${duplicateUser.display_name}). Unlink it there first.`)
    return
  }

  // 3. Perform link in users table
  const { data: updatedUser, error: updateError } = await adminSupabase
    .from('users')
    .update({ telegram_id: telegramId })
    .eq('id', linkCode.user_id)
    .select('display_name')
    .single()

  if (updateError) {
    console.error('Error linking user telegram_id:', updateError)
    await ctx.reply('❌ Failed to link Telegram account. Please try again.')
    return
  }

  // 4. Mark code as used
  await adminSupabase
    .from('telegram_link_codes')
    .update({ used: true })
    .eq('code', code)

  await ctx.reply(
    `🎉 *Success!*\n\n` +
    `Your Telegram account has been linked to *${updatedUser.display_name}*.\n\n` +
    `🚀 *Get Started:*\n` +
    `• Use \`/rate\` to search and rate an anime or manga title.\n` +
    `• Use \`/myratings\` to see your recent ratings.\n` +
    `• Use \`/events\` to see upcoming club events.\n` +
    `• Use \`/trending\` to see top-rated titles.\n` +
    `• Use \`/whoami\` to view your status.`,
    { parse_mode: 'Markdown' }
  )
}
