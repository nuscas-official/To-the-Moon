import { Bot, Context, session, SessionFlavor } from 'grammy'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentSeason, getSeasonStandings, type SeasonNominee } from '@/lib/seasonPick'

// Only the bare `/nominate` prompt waits on the next message. Buttons carry
// their own IDs in callback_data, so they keep working after the serverless
// instance (and this in-memory session) is recycled.
export interface SessionData {
  step?: 'awaiting_nomination_query';
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
  const GROUP_ALLOWED_COMMANDS = ['/season', '/events', '/help']

  botInstance.use(async (ctx, next) => {
    // In group/supergroup chats, skip auth and only allow a small set of
    // read-only commands. Everything else (linking, nominating, voting)
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
        `To the Moon is the NUS Comics and Animation Society member portal bot. Help choose the club's Anime of the Season and keep up with events.\n\n` +
        `Use these commands:\n` +
        COMMAND_LIST,
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

  // 6. Command: /help
  botInstance.command('help', async (ctx) => {
    await ctx.reply(
      `🤖 *NUSCAS Bot Commands:*\n\n` +
      COMMAND_LIST + `\n\n` +
      `*Linking commands:*\n` +
      `/link <CODE> — Link account using settings page code`,
      { parse_mode: 'Markdown' }
    )
  })

  // 7. Command: /nominate [title] — search AniList and nominate an anime
  botInstance.command('nominate', async (ctx) => {
    const query = (ctx.match || '').trim()
    if (query) {
      ctx.session.step = undefined
      await replyWithNominationSearch(ctx, query)
      return
    }
    ctx.session.step = 'awaiting_nomination_query'
    const season = getCurrentSeason()
    await ctx.reply(
      `🌙 *Nominate Anime of the Season — ${season.label}*\n\n` +
      `Send the title you want to nominate and I'll search AniList:`,
      { parse_mode: 'Markdown' }
    )
  })

  // 8. Command: /vote — pick one of this season's nominees
  botInstance.command('vote', async (ctx) => {
    await replyWithBallot(ctx)
  })

  // 9. Command: /season — current standings (also allowed in groups)
  botInstance.command('season', async (ctx) => {
    const season = getCurrentSeason()
    let standings: SeasonNominee[]
    try {
      standings = await getSeasonStandings(season.key)
    } catch (err) {
      console.error('Error fetching season standings in bot:', err)
      await ctx.reply("An error occurred fetching this season's standings.")
      return
    }

    if (standings.length === 0) {
      await ctx.reply(
        `🌙 *Anime of the Season — ${season.label}*\n\n` +
        `No nominations yet. DM me /nominate to put one forward!`,
        { parse_mode: 'Markdown' }
      )
      return
    }

    let text = `🌙 *Anime of the Season — ${season.label}*\n\n`
    standings.slice(0, 5).forEach((n, idx) => {
      const medal = ['🥇', '🥈', '🥉'][idx] || `${idx + 1}.`
      text += `${medal} *${escapeMarkdown(n.title)}* — ${formatVotes(n.votes)}\n`
    })
    if (standings.length > 5) {
      text += `…and ${standings.length - 5} more.\n`
    }
    text += `\nDM me /vote to have your say.`

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

  // 10. Callback Query Handler (inline keyboard buttons)
  botInstance.on('callback_query:data', async (ctx) => {
    const data = ctx.callbackQuery.data
    const userProfile = ctx.userProfile
    if (!userProfile) {
      await ctx.answerCallbackQuery({ text: 'Please link your account first.' })
      return
    }

    const adminSupabase = createAdminClient()
    const season = getCurrentSeason()

    if (data.startsWith('nominate:')) {
      const anilistId = parseInt(data.slice('nominate:'.length), 10)
      if (isNaN(anilistId)) {
        await ctx.answerCallbackQuery({ text: 'Invalid selection.' })
        return
      }

      // Reuse the existing nomination if someone already put this title forward.
      let { data: nomination } = await adminSupabase
        .from('season_nominations')
        .select('id, title')
        .eq('season', season.key)
        .eq('anilist_id', anilistId)
        .maybeSingle()

      if (!nomination) {
        const { fetchAniListAnime } = await import('@/lib/anilist')
        const anime = await fetchAniListAnime(anilistId)
        if (!anime) {
          await ctx.answerCallbackQuery({ text: 'Could not load that title.' })
          await ctx.reply('❌ Could not load that title from AniList. Please try again.')
          return
        }

        const { data: inserted, error: insertError } = await adminSupabase
          .from('season_nominations')
          .insert({
            season: season.key,
            anilist_id: anime.id,
            title: anime.title,
            image_url: anime.image_url,
            accent_hex: anime.accent_hex,
            nominated_by: userProfile.id
          })
          .select('id, title')
          .single()

        if (insertError) {
          // Someone may have nominated the same title a moment ago; use theirs.
          const { data: existing } = await adminSupabase
            .from('season_nominations')
            .select('id, title')
            .eq('season', season.key)
            .eq('anilist_id', anilistId)
            .maybeSingle()
          if (!existing) {
            console.error('Error saving nomination via Telegram bot:', insertError)
            await ctx.answerCallbackQuery({ text: 'Error saving nomination.' })
            await ctx.reply('❌ Failed to save your nomination. Please try again.')
            return
          }
          nomination = existing
        } else {
          nomination = inserted
        }
      }

      // Nominating counts as your vote for it.
      const saved = await castVote(userProfile.id, season.key, nomination.id)
      if (!saved) {
        await ctx.answerCallbackQuery({ text: 'Error saving vote.' })
        await ctx.reply('❌ Your nomination was saved, but your vote failed. Try /vote.')
        return
      }

      await ctx.answerCallbackQuery({ text: 'Nominated!' })
      await ctx.editMessageText(
        `✅ *${escapeMarkdown(nomination.title)}* is nominated for Anime of the Season (${season.label}), and your vote is on it.\n\n` +
        `Use /vote to change your vote or /season to see the standings.`,
        { parse_mode: 'Markdown' }
      )
    } else if (data.startsWith('vote:')) {
      const nominationId = data.slice('vote:'.length)

      // A ballot left open from last season must not count toward this one.
      const { data: nomination } = await adminSupabase
        .from('season_nominations')
        .select('id, title')
        .eq('id', nominationId)
        .eq('season', season.key)
        .maybeSingle()

      if (!nomination) {
        await ctx.answerCallbackQuery({ text: 'That ballot has closed.' })
        await ctx.reply(`⚠️ That title isn't on the ${season.label} ballot. Send /vote for the current one.`)
        return
      }

      const saved = await castVote(userProfile.id, season.key, nomination.id)
      if (!saved) {
        await ctx.answerCallbackQuery({ text: 'Error saving vote.' })
        await ctx.reply('❌ Failed to save your vote. Please try again.')
        return
      }

      await ctx.answerCallbackQuery({ text: `Voted for ${nomination.title}` })
      const ballot = await buildBallot(userProfile.id)
      if (ballot) {
        await ctx.editMessageText(ballot.text, { parse_mode: 'Markdown', reply_markup: ballot.keyboard })
          .catch(() => {}) // "message is not modified" when re-tapping your current vote
      }
    } else {
      // Old /rate buttons still sitting in people's chats.
      await ctx.answerCallbackQuery({ text: 'This button is no longer supported.' })
    }
  })

  // 11. Message handler for text entry (nomination search query)
  botInstance.on('message:text', async (ctx) => {
    if (ctx.session.step === 'awaiting_nomination_query') {
      const query = ctx.message.text.trim()
      if (!query) {
        await ctx.reply('Please enter a valid search term:')
        return
      }
      ctx.session.step = undefined
      await replyWithNominationSearch(ctx, query)
    } else {
      const userProfile = ctx.userProfile
      if (userProfile) {
        await ctx.reply(
          `Hello, *${escapeMarkdown(userProfile.display_name)}*!\n\n` +
          `Use /nominate to put forward an Anime of the Season, /vote to vote, or /help to see all available commands.`,
          { parse_mode: 'Markdown' }
        )
      }
    }
  })

  return botInstance
}

const COMMAND_LIST =
  `/nominate — Nominate an Anime of the Season\n` +
  `/vote — Vote for this season's pick\n` +
  `/season — Show the current standings\n` +
  `/events — Show upcoming club events\n` +
  `/whoami — Show your profile and link status\n` +
  `/unlink — Unlink your Telegram account\n` +
  `/help — Show all commands`

/** Escapes characters that break Telegram's legacy Markdown parse mode. */
function escapeMarkdown(text: string): string {
  return text.replace(/([_*`[])/g, '\\$1')
}

function formatVotes(count: number): string {
  return `${count} vote${count === 1 ? '' : 's'}`
}

/** Records (or moves) a member's single vote for the season. */
async function castVote(userId: string, seasonKey: string, nominationId: string): Promise<boolean> {
  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase
    .from('season_votes')
    .upsert({
      season: seasonKey,
      user_id: userId,
      nomination_id: nominationId,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'season,user_id'
    })

  if (error) {
    console.error('Error saving season vote via Telegram bot:', error)
    return false
  }
  return true
}

/** Searches AniList and replies with one button per anime to nominate. */
async function replyWithNominationSearch(ctx: BotContext, query: string) {
  const chatId = ctx.chat?.id
  if (!chatId) return

  const loadingMsg = await ctx.reply('🔍 Searching AniList...')

  try {
    const { searchAniListAnime } = await import('@/lib/anilist')
    const results = await searchAniListAnime(query)
    await ctx.api.deleteMessage(chatId, loadingMsg.message_id)

    if (results.length === 0) {
      ctx.session.step = 'awaiting_nomination_query'
      await ctx.reply('❌ No anime found. Please try searching for another title:')
      return
    }

    await ctx.reply('Which anime do you want to nominate?', {
      reply_markup: {
        inline_keyboard: results.map(item => [{
          text: item.season_label ? `${item.title} (${item.season_label})` : item.title,
          callback_data: `nominate:${item.id}`
        }])
      }
    })
  } catch (err) {
    console.error('Error during nomination search in bot:', err)
    await ctx.api.deleteMessage(chatId, loadingMsg.message_id).catch(() => {})
    await ctx.reply('An error occurred searching AniList. Please try again.')
  }
}

/** Ballot text + buttons for the current season, marking the member's vote. */
async function buildBallot(userId: string) {
  const season = getCurrentSeason()
  const adminSupabase = createAdminClient()

  const [standings, { data: myVote }] = await Promise.all([
    getSeasonStandings(season.key),
    adminSupabase
      .from('season_votes')
      .select('nomination_id')
      .eq('season', season.key)
      .eq('user_id', userId)
      .maybeSingle()
  ])

  if (standings.length === 0) return null

  return {
    text:
      `🗳 *Anime of the Season — ${season.label}*\n\n` +
      `Tap a title to vote. You get one vote per season and can change it any time. ` +
      `The leader is featured on the NUSCAS homepage.`,
    keyboard: {
      inline_keyboard: standings.slice(0, 20).map(n => [{
        text: `${myVote?.nomination_id === n.id ? '✅ ' : ''}${n.title} — ${formatVotes(n.votes)}`,
        callback_data: `vote:${n.id}`
      }])
    }
  }
}

async function replyWithBallot(ctx: BotContext) {
  const userProfile = ctx.userProfile
  if (!userProfile) {
    await ctx.reply('Please link your Telegram account first using /link.')
    return
  }

  try {
    const ballot = await buildBallot(userProfile.id)
    if (!ballot) {
      await ctx.reply(`🗳 No nominations for ${getCurrentSeason().label} yet. Be the first with /nominate!`)
      return
    }
    await ctx.reply(ballot.text, { parse_mode: 'Markdown', reply_markup: ballot.keyboard })
  } catch (err) {
    console.error('Error building ballot in bot:', err)
    await ctx.reply('An error occurred loading the ballot. Please try again.')
  }
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
    `• Use \`/nominate\` to put forward an Anime of the Season.\n` +
    `• Use \`/vote\` to vote for this season's pick.\n` +
    `• Use \`/season\` to see the current standings.\n` +
    `• Use \`/events\` to see upcoming club events.\n` +
    `• Use \`/whoami\` to view your status.`,
    { parse_mode: 'Markdown' }
  )
}
