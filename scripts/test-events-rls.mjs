import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Read env variables from .env.local
const envContent = readFileSync('.env.local', 'utf-8')
const env = {}
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
    env[key] = val
  }
})

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']
const anonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY']
const serviceRoleKey = env['SUPABASE_SERVICE_ROLE_KEY']

if (!supabaseUrl || !serviceRoleKey || !anonKey) {
  console.error('Missing environment keys in .env.local')
  process.exit(1)
}

// 1. Create clients
const supabaseService = createClient(supabaseUrl, serviceRoleKey)
const supabaseAnon = createClient(supabaseUrl, anonKey)

async function runTest() {
  console.log('--- STARTING EVENTS RLS SECURITY CHECKS ---')

  const upcomingSlug = 'rls-test-upcoming-' + Math.random().toString(36).substring(7)
  const cancelledSlug = 'rls-test-cancelled-' + Math.random().toString(36).substring(7)
  
  let upcomingId = null
  let cancelledId = null

  try {
    // 2. Insert test events using service client (bypasses RLS)
    console.log('\n[1] Inserting test events via admin/service client...')
    
    const { data: upEvent, error: upError } = await supabaseService
      .from('events')
      .insert({
        title: 'RLS Test Upcoming Event',
        slug: upcomingSlug,
        starts_at: new Date().toISOString(),
        status: 'upcoming',
        location: 'Test Room 1'
      })
      .select('id')
      .single()

    if (upError) throw new Error('Failed to insert upcoming event: ' + upError.message)
    upcomingId = upEvent.id
    console.log(` -> Inserted upcoming event ID: ${upcomingId}`)

    const { data: canEvent, error: canError } = await supabaseService
      .from('events')
      .insert({
        title: 'RLS Test Cancelled Event',
        slug: cancelledSlug,
        starts_at: new Date().toISOString(),
        status: 'cancelled',
        location: 'Test Room 2'
      })
      .select('id')
      .single()

    if (canError) throw new Error('Failed to insert cancelled event: ' + canError.message)
    cancelledId = canEvent.id
    console.log(` -> Inserted cancelled event ID: ${cancelledId}`)

    // 3. Query events via anon client
    console.log('\n[2] Querying events via Anon client (Subject to RLS)...')
    const { data: anonEvents, error: anonQueryError } = await supabaseAnon
      .from('events')
      .select('id, title, status')
      .in('id', [upcomingId, cancelledId])

    if (anonQueryError) {
      console.warn(' -> Query failed or returned error:', anonQueryError.message)
    }

    const fetchedIds = anonEvents ? anonEvents.map(e => e.id) : []
    const hasUpcoming = fetchedIds.includes(upcomingId)
    const hasCancelled = fetchedIds.includes(cancelledId)

    console.log(` -> Total test events returned: ${fetchedIds.length}`)
    console.log(` -> Upcoming event returned? ${hasUpcoming ? 'YES' : 'NO'}`)
    console.log(` -> Cancelled event returned? ${hasCancelled ? 'YES' : 'NO'}`)

    // Assess RLS policy status
    if (hasUpcoming && !hasCancelled) {
      console.log(' -> SUCCESS: RLS successfully hides cancelled events and exposes upcoming events to public!')
    } else if (hasUpcoming && hasCancelled) {
      console.log(' -> WARNING: RLS allows public to read cancelled events. (Did you apply the migration SQL on Supabase?)')
    } else {
      console.log(' -> INFO: No events returned. RLS select policy is completely missing or blocked (defaults to deny).')
    }

    // 4. Try to write via anon client
    console.log('\n[3] Attempting unauthorized insert via Anon client...')
    const { data: anonInsert, error: anonInsertError } = await supabaseAnon
      .from('events')
      .insert({
        title: 'RLS Attack Event',
        slug: 'rls-attack-' + Math.random().toString(36).substring(7),
        starts_at: new Date().toISOString(),
        status: 'upcoming'
      })

    if (anonInsertError) {
      console.log(' -> SUCCESS: Anon client insert blocked by RLS as expected! Error message:', anonInsertError.message)
    } else {
      console.log(' -> FAILURE: Anon client successfully inserted a row! RLS write controls are missing!')
    }

  } catch (err) {
    console.error('Error during test execution:', err.message)
  } finally {
    // 5. Cleanup
    console.log('\n[4] Cleaning up test events...')
    if (upcomingId) {
      await supabaseService.from('events').delete().eq('id', upcomingId)
    }
    if (cancelledId) {
      await supabaseService.from('events').delete().eq('id', cancelledId)
    }
    console.log(' -> Cleanup completed.')
    console.log('\n--- EVENTS RLS SECURITY CHECKS COMPLETED ---')
  }
}

runTest()
