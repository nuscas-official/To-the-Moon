import { type SupabaseClient } from '@supabase/supabase-js'

/**
 * Converts a raw text string into a URL-friendly slug.
 * Truncates to a maximum length (default: 60 characters).
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars except hyphens
    .replace(/\-\-+/g, '-')         // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '')             // Trim hyphens from start
    .replace(/-+$/, '')             // Trim hyphens from end
    .slice(0, 60)                   // Truncate to 60 chars
}

/**
 * Generates a unique slug for a given table and title.
 * If a collision is found in the database, it appends a random 4-char hex suffix.
 */
export async function generateUniqueSlug(
  supabase: SupabaseClient,
  table: 'posts' | 'events',
  title: string
): Promise<string> {
  const baseSlug = slugify(title) || 'untitled'

  // Check if base slug exists in the database
  const { data, error } = await supabase
    .from(table)
    .select('slug')
    .eq('slug', baseSlug)
    .maybeSingle()

  // If no collision is found (or query fails), return the base slug
  if (error || !data) {
    return baseSlug
  }

  // Collision detected: generate a random 4-character hex suffix
  const randomHex = Math.floor(0x1000 + Math.random() * 0xefff).toString(16).slice(0, 4)
  
  // Truncate base slug to ensure final slug length is <= 60 characters
  // Format: [truncatedBase]-[4-char-hex] -> total 60 chars maximum
  const maxBaseLength = 60 - 5 // 5 chars for '-' and 4 hex digits
  const truncatedBase = baseSlug.slice(0, maxBaseLength)
  
  return `${truncatedBase}-${randomHex}`
}
