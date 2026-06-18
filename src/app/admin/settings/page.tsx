import { createAdminClient } from '@/lib/supabase/admin'
import AdminSettingsClient from '@/components/features/admin/AdminSettingsClient'

interface SeasonalPick {
  title: string
  accent_hex: string
  image_url: string
}

export default async function AdminSettingsPage() {
  const supabase = createAdminClient()

  // 1. Fetch current seasonal pick config
  let seasonalPick: SeasonalPick | null = null
  try {
    const { data, error } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', 'seasonal_pick')
      .single()

    if (!error && data?.value) {
      seasonalPick = data.value as unknown as SeasonalPick
    }
  } catch (err) {
    console.error('Failed to load seasonal_pick config:', err)
  }

  // 2. Fetch current join reasons config
  let joinReasons = null
  try {
    const { data, error } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', 'join_reasons')
      .single()

    if (!error && data?.value) {
      joinReasons = data.value as string[]
    }
  } catch (err) {
    console.error('Failed to load join_reasons config:', err)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-black tracking-tight text-neutral-900">
          Site Settings & Configurations
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Modify landing page features, active highlights, and list resources.
        </p>
      </div>

      {/* Main Settings Client component */}
      <AdminSettingsClient
        initialSeasonalPick={seasonalPick}
        initialJoinReasons={joinReasons}
      />
    </div>
  )
}
