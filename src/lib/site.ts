/**
 * One source of truth for the canonical origin and the club's public identity.
 * Metadata, sitemap, robots, and every JSON-LD block read from here so they
 * can't drift apart.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nuscas.com'

export const SITE_NAME = 'NUSCAS'

export const ORG_LEGAL_NAME = 'NUS Comics and Animation Society'

export const ORG_DESCRIPTION =
  'The National University of Singapore student society for anime, manga, games, cosplay, and Japanese pop culture. Screenings, art workshops, conventions, and socials, run by the CASuals, TOPICS, and Palette departments.'

export const ORG_EMAIL = 'nuscomicssoc@gmail.com'

export const ORG_SOCIALS = [
  'https://www.instagram.com/nuscomicsoc/',
  'https://www.youtube.com/channel/UCKkESIjFh--HD5yOpGmm_JA',
  'https://linktr.ee/nuscas',
]

export const ORG_LOGO = `${SITE_URL}/images/nuscas-favicon.webp`

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`

/** Stable @id so Event.organizer and the root Organization node resolve to one entity. */
export const ORG_ID = `${SITE_URL}/#organization`
