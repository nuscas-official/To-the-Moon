import { createAdminClient } from '@/lib/supabase/admin'
import AdminSettingsClient from '@/components/features/admin/AdminSettingsClient'
import PageHeader from '@/components/ui/PageHeader'

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
      <PageHeader
        eyebrow="Committee Console"
        title="Site Settings"
        description="Modify landing page features, active highlights, and list resources."
        divider
        className=""
      />

      {/* Main Settings Client component */}
      <AdminSettingsClient
        initialSeasonalPick={seasonalPick}
        initialJoinReasons={joinReasons}
      />
    </div>
  )
}
