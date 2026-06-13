import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

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
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || env['SUPABASE_SERVICE_ROLE_KEY']

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env keys', { supabaseUrl, supabaseKey })
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  console.log('Querying users...')
  const { data: users, error: errUsers } = await supabase.from('users').select('*').limit(5)
  console.log('Users:', users, errUsers)

  console.log('Querying site_config...')
  const { data: configs, error: errConfigs } = await supabase.from('site_config').select('*')
  console.log('Configs:', configs, errConfigs)

  console.log('Querying events...')
  const { data: events, error: errEvents } = await supabase.from('events').select('*').limit(5)
  console.log('Events:', events, errEvents)
}

test()
