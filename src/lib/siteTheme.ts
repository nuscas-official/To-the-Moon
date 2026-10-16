import { cache } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Site-wide seasonal skin, toggled from Admin → Settings and stored in
 * site_config under `site_theme`. 'default' is the normal NUSCAS look; any
 * other value adds a `theme-<name>` class to <html> (see tokens.css).
 */
export const SITE_THEMES = ['default', 'halloween'] as const
export type SiteTheme = (typeof SITE_THEMES)[number]

export function isSiteTheme(value: unknown): value is SiteTheme {
  return typeof value === 'string' && (SITE_THEMES as readonly string[]).includes(value)
}

/** Deduplicated per request so the layout and pages can both ask cheaply. */
export const getSiteTheme = cache(async (): Promise<SiteTheme> => {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', 'site_theme')
      .maybeSingle()

    const theme = (data?.value as { theme?: unknown } | null)?.theme
    if (!error && isSiteTheme(theme)) return theme
  } catch (err) {
    console.error('Failed to load site_theme config, using default:', err)
  }
  return 'default'
})
