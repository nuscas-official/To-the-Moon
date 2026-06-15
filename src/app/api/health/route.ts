import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // Optional security: Check a header secret to prevent public database spamming
  const clientSecret = request.headers.get('X-Health-Check-Key')
  const serverSecret = process.env.HEALTH_CHECK_SECRET
  
  if (serverSecret && clientSecret !== serverSecret) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = createClient()
  
  // Execute a lightweight read query to register activity on Supabase
  const { error } = await supabase
    .from('site_config')
    .select('key')
    .limit(1)

  if (error) {
    console.error('Health connection check failed:', error)
    return NextResponse.json({ status: 'error', error: error.message }, { status: 500 })
  }

  return NextResponse.json({ status: 'ok', database: 'connected' })
}
