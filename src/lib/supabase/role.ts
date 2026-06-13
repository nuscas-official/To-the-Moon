import { type SupabaseClient } from '@supabase/supabase-js'

/**
 * Decodes the current Supabase session JWT access token to read the custom claim `user_role`.
 * Compatible with Node.js (Server Components) and Edge Runtime (Middleware).
 */
export async function getUserRole(supabase: SupabaseClient): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  const token = session?.access_token
  if (!token) return null

  try {
    // JWT format: header.payload.signature
    const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payloadJson = atob(payloadBase64)
    const payload = JSON.parse(payloadJson)
    
    return payload?.app_metadata?.user_role || null
  } catch (error) {
    console.error('Failed to decode JWT custom claims:', error)
    return null
  }
}
