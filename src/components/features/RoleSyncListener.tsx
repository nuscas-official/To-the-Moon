'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { type User } from '@supabase/supabase-js'

interface RoleSyncListenerProps {
  user: User | null
  currentRole: string | null
}

export default function RoleSyncListener({ user, currentRole }: RoleSyncListenerProps) {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`user-profile-sync:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        },
        async (payload) => {
          const newRole = payload.new.role
          const newIsActive = payload.new.is_active

          // 1. Check if user is deactivated
          if (newIsActive === false) {
            await supabase.auth.signOut()
            router.refresh()
            window.location.href = '/?reason=deactivated'
            return
          }

          // 2. Check if role has changed compared to what is currently rendered/cached
          if (newRole !== currentRole) {
            const { error } = await supabase.auth.refreshSession()
            if (!error) {
              router.refresh()
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, currentRole, supabase, router])

  return null
}
