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
const secretKey = env['SUPABASE_SECRET_KEY']

if (!supabaseUrl || !secretKey) {
  console.error('Missing env keys')
  process.exit(1)
}

const supabaseService = createClient(supabaseUrl, secretKey)

async function run() {
  console.log('Upserting correct site_config values...')
  
  const seasonalPick = {
    title: "Sousou no Frieren",
    accent_hex: "#c82333", // Crimson
    image_url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80"
  }

  const joinReasons = [
    "Free instant ramen during weekly screenings (if you can beat the president in rock-paper-scissors)",
    "We have a dedicated server to argue about whether subs or dubs are superior",
    "To fulfill your lifelong dream of running like Naruto down the university corridors",
    "Our clubroom has a shrine to the great goddess Haruhi Suzumiya",
    "To find someone who will actually watch all 1000+ episodes of One Piece with you",
    "Because writing CSS is just a visual novel with too many choices",
    "An excuse to play anime openings at maximum volume in the student lounge"
  ]

  // Delete wrong key if exists
  await supabaseService.from('site_config').delete().eq('key', 'seasonal_picks')

  // Insert correct keys
  const { error } = await supabaseService.from('site_config').upsert([
    { key: 'seasonal_pick', value: seasonalPick },
    { key: 'join_reasons', value: joinReasons }
  ])

  if (error) {
    console.error('Error fixing site_config:', error)
  } else {
    console.log('Successfully updated site_config keys in Supabase!')
  }
}

run()
