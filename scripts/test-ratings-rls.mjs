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

// Create clients
const supabaseService = createClient(supabaseUrl, serviceRoleKey)
const supabaseAnon = createClient(supabaseUrl, anonKey)

async function runTest() {
  console.log('--- STARTING RATINGS RLS SECURITY CHECKS ---')

  const testAnilistId = Math.floor(100000 + Math.random() * 900000)
  let testRatingId = null
  let mockUserId = null

  try {
    // 1. Fetch a real user ID to use for mock rating
    console.log('\n[1] Fetching a user ID for mock rating data...')
    const { data: users, error: userError } = await supabaseService
      .from('users')
      .select('id')
      .limit(1)

    if (userError || !users || users.length === 0) {
      throw new Error('No users found in database to link mock rating to. Run seeding first!')
    }
    mockUserId = users[0].id
    console.log(` -> Selected User ID: ${mockUserId}`)

    // 2. Insert rating via service client (bypasses RLS)
    console.log('\n[2] Inserting test rating via admin/service client...')
    const { data: rating, error: insertError } = await supabaseService
      .from('ratings')
      .insert({
        user_id: mockUserId,
        anilist_id: testAnilistId,
        media_type: 'anime',
        title_en: 'RLS Verification Anime',
        cover_image_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=100',
        score: 9,
        note: 'Super secret private note'
      })
      .select('id')
      .single()

    if (insertError) throw new Error('Failed to insert test rating: ' + insertError.message)
    testRatingId = rating.id
    console.log(` -> Inserted test rating ID: ${testRatingId}`)

    // 3. Attempt to read directly from `ratings` table via Anon client
    console.log('\n[3] Querying `ratings` table directly via Anon client...')
    const { data: anonRatings, error: anonReadError } = await supabaseAnon
      .from('ratings')
      .select('*')
      .eq('id', testRatingId)

    if (anonReadError) {
      console.log(' -> Anon query failed (as expected if RLS defaults to deny):', anonReadError.message)
    }

    const fetchedAnonCount = anonRatings ? anonRatings.length : 0
    console.log(` -> Ratings returned directly to Anon: ${fetchedAnonCount}`)
    if (fetchedAnonCount === 0) {
      console.log(' -> SUCCESS: Direct anonymous read of `ratings` table was BLOCKED by RLS!')
    } else {
      console.log(' -> FAILURE: Direct anonymous read of `ratings` table was ALLOWED! RLS policies missing or weak!')
    }

    // 4. Query aggregates view via Anon client
    console.log('\n[4] Querying `public_rating_aggregates` view via Anon client...')
    const { data: aggregates, error: aggError } = await supabaseAnon
      .from('public_rating_aggregates')
      .select('*')

    if (aggError) {
      console.error(' -> Aggregates view read failed:', aggError.message)
    } else {
      console.log(` -> Aggregates returned: ${aggregates.length}`)
      console.log(' -> SUCCESS: Public is allowed to query the aggregates view!')
    }

    // 5. Attempt unauthorized insert via Anon client
    console.log('\n[5] Attempting unauthorized insert into `ratings` via Anon client...')
    const { data: anonInsert, error: anonInsertError } = await supabaseAnon
      .from('ratings')
      .insert({
        user_id: mockUserId,
        anilist_id: testAnilistId + 1,
        media_type: 'anime',
        title_en: 'RLS Hack Anime',
        score: 1
      })

    if (anonInsertError) {
      console.log(' -> SUCCESS: Anon client insert blocked by RLS! Error:', anonInsertError.message)
    } else {
      console.log(' -> FAILURE: Anon client successfully inserted a row! RLS write controls are missing!')
    }

  } catch (err) {
    console.error('Error during test execution:', err.message)
  } finally {
    // 6. Cleanup
    console.log('\n[6] Cleaning up test rating...')
    if (testRatingId) {
      const { error: cleanError } = await supabaseService
        .from('ratings')
        .delete()
        .eq('id', testRatingId)
      if (cleanError) {
        console.error(' -> Failed to delete mock rating during cleanup:', cleanError.message)
      } else {
        console.log(' -> Cleanup completed.')
      }
    }
    console.log('\n--- RATINGS RLS SECURITY CHECKS COMPLETED ---')
  }
}

runTest()
