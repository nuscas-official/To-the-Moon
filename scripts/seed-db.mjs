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
  console.error('Missing env keys', { supabaseUrl, serviceRoleKey, anonKey })
  process.exit(1)
}

const supabaseService = createClient(supabaseUrl, serviceRoleKey)
const supabaseAnon = createClient(supabaseUrl, anonKey)

async function seed() {
  console.log('Seeding site_config...')
  
  const seasonalPicks = [
    {
      title: "Sousou no Frieren",
      description: "An elf mage and her former party members' journey. A story about time, legacy, and human connection.",
      image_url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80",
      link: "https://anilist.co/anime/154587/Sousou-no-Frieren/",
      recommendation_reason: "Highly requested by members. A gorgeous exploration of life after the hero's journey, with stellar animation.",
      type: "Featured Anime"
    },
    {
      title: "Oshi no Ko Season 2",
      description: "Delve deeper into the dark side of the entertainment industry, focusing on the 2.5D stage play adaptation.",
      image_url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80",
      link: "https://anilist.co/anime/166531/Oshi-no-Ko-2nd-Season/",
      recommendation_reason: "The theatrical arc offers unparalleled drama, character development, and peak psychological suspense.",
      type: "Drama & Suspense"
    },
    {
      title: "Chainsaw Man: Reze Arc",
      description: "Denji meets a mysterious girl named Reze in a cafe, setting off a wild chain of chaotic and romantic events.",
      image_url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&auto=format&fit=crop&q=80",
      link: "https://anilist.co/anime/173909/Chainsaw-Man-Movie-Reze-hen/",
      recommendation_reason: "One of the most anticipated movie events. Explosive action and a tragic romance that will leave you gasping.",
      type: "Action Movie"
    }
  ]

  const joinReasons = [
    "Free instant ramen during weekly screenings (if you can beat the president in rock-paper-scissors)",
    "We have a dedicated server to argue about whether subs or dubs are superior",
    "To fulfill your lifelong dream of running like Naruto down the university corridors",
    "Our clubroom has a shrine to the great goddess Haruhi Suzumiya",
    "To find someone who will actually watch all 1000+ episodes of One Piece with you",
    "Because writing CSS is just a visual novel with too many choices",
    "An excuse to play anime openings at maximum volume in the student lounge"
  ]

  const { error: err1 } = await supabaseService.from('site_config').upsert([
    { key: 'seasonal_picks', value: seasonalPicks },
    { key: 'join_reasons', value: joinReasons }
  ])

  if (err1) {
    console.error('Error seeding site_config:', err1)
  } else {
    console.log('Successfully seeded site_config')
  }

  console.log('Seeding events...')
  
  const events = [
    {
      title: "Welcome Tea & Summer Screening",
      slug: "welcome-tea-summer-2026",
      description: "Kick off the semester with our Welcome Tea! Meet other members, learn about our weekly activities, and cast your votes for our seasonal weekly screening series. Free snacks and drinks will be provided.",
      starts_at: "2026-06-20T10:00:00Z",
      ends_at: "2026-06-20T13:00:00Z",
      location: "LT19, Faculty of Science",
      status: "upcoming"
    },
    {
      title: "Anime Art & Cosplay Workshop",
      slug: "art-cosplay-workshop",
      description: "Interested in drawing manga or crafting your first cosplay? Join our joint workshop hosted by the creative and cosplay sub-committees. Learn prop making, wig styling, and digital illustration tips.",
      starts_at: "2026-06-27T14:00:00Z",
      ends_at: "2026-06-27T17:00:00Z",
      location: "UTown SR3, Stephen Riady Centre",
      status: "upcoming"
    },
    {
      title: "Vocaloid Night & Karaoke Session",
      slug: "vocaloid-night-karaoke",
      description: "Celebrate Vocaloid culture! Sing your favorite anime openings, endings, and Vocaloid classics in our high-energy karaoke room. Snacks, neon lights, and music games included.",
      starts_at: "2026-07-04T18:00:00Z",
      ends_at: "2026-07-04T22:00:00Z",
      location: "Yusof Ishak House (YIH) Student Lounge",
      status: "upcoming"
    }
  ]

  const { error: err2 } = await supabaseService.from('events').upsert(events, { onConflict: 'slug' })

  if (err2) {
    console.error('Error seeding events:', err2)
  } else {
    console.log('Successfully seeded events')
  }

  // Now verify with anon client
  console.log('Verifying site_config with Anon client...')
  const { data: anonConfigs, error: anonErrConfigs } = await supabaseAnon.from('site_config').select('*')
  console.log('Anon client site_config count:', anonConfigs ? anonConfigs.length : 0, 'Error:', anonErrConfigs)

  console.log('Verifying events with Anon client...')
  const { data: anonEvents, error: anonErrEvents } = await supabaseAnon.from('events').select('*')
  console.log('Anon client events count:', anonEvents ? anonEvents.length : 0, 'Error:', anonErrEvents)
}

seed()
