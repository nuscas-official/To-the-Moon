import { createClient } from '@supabase/supabase-js'

/**
 * Creates a server-side Supabase client using the SUPABASE_SERVICE_ROLE_KEY.
 * This client bypasses Row-Level Security (RLS) policies.
 * 
 * CRITICAL: This MUST ONLY be run in Server Components, Server Actions, or Route Handlers.
 * It must never be exported to or imported by client-side code.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables for Admin Client.')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
