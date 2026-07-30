import { cache } from 'react'
import { createClient } from './server'
import { getUserRole } from './role'
import { type User } from '@supabase/supabase-js'

export interface AuthContext {
  user: User | null
  role: string | null
}

/**
 * Cached helper to fetch current user and user role within a single React Server Component
 * render pass. Uses React `cache()` to deduplicate calls across RootLayout and Page components
 * on the same request lifecycle.
 */
export const getAuthUserAndRole = cache(async (): Promise<AuthContext> => {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, role: null }
  }

  const role = await getUserRole(supabase)
  return { user, role }
})
