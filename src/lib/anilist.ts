export interface AniListResult {
  id: number;
  title: {
    english: string | null;
    romaji: string | null;
  };
  coverImage: {
    medium: string | null;
  };
  type: 'ANIME' | 'MANGA';
}

interface AniListRawItem {
  id: number;
  title?: {
    english?: string;
    romaji?: string;
  };
  coverImage?: {
    medium?: string;
  };
  type?: string;
}

interface AniListGraphQLResponse {
  data?: {
    Page?: {
      media?: AniListRawItem[];
    };
  };
}

/**
 * Searches the AniList GraphQL API for media matching the search query.
 * Restricts results to the top 5 sorted by popularity.
 */
export async function searchAniList(query: string): Promise<AniListResult[]> {
  if (!query || !query.trim()) return []

  const graphQLQuery = `
    query ($search: String) {
      Page(page: 1, perPage: 5) {
        media(search: $search, sort: POPULARITY_DESC) {
          id
          title {
            english
            romaji
          }
          coverImage {
            medium
          }
          type
        }
      }
    }
  `

  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: graphQLQuery,
        variables: { search: query.trim() },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('AniList GraphQL API error response:', errorText)
      return []
    }

    const json = (await response.json()) as AniListGraphQLResponse
    const media = json?.data?.Page?.media
    if (!media || !Array.isArray(media)) {
      return []
    }

    return media.map((item: AniListRawItem) => ({
      id: item.id,
      title: {
        english: item.title?.english || null,
        romaji: item.title?.romaji || null,
      },
      coverImage: {
        medium: item.coverImage?.medium || null,
      },
      type: item.type === 'MANGA' ? 'MANGA' : 'ANIME',
    }))
  } catch (error) {
    console.error('Failed to query AniList GraphQL API:', error)
    return []
  }
}

export interface AniListMediaDetail {
  id: number;
  cover_image_url: string | null;
  title_en: string | null;
}

/**
 * Fetches media details (including cover image URL) from AniList for a list of AniList IDs.
 */
export async function fetchAniListMediaDetails(ids: number[]): Promise<Record<number, AniListMediaDetail>> {
  if (!ids || ids.length === 0) return {}

  const graphQLQuery = `
    query ($ids: [Int]) {
      Page(page: 1, perPage: 50) {
        media(id_in: $ids) {
          id
          title {
            english
            romaji
          }
          coverImage {
            large
            medium
          }
        }
      }
    }
  `

  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: graphQLQuery,
        variables: { ids },
      }),
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      console.error('AniList GraphQL API error during batch fetch')
      return {}
    }

    const json = await response.json()
    const mediaList = json?.data?.Page?.media || []

    const map: Record<number, AniListMediaDetail> = {}
    for (const item of mediaList) {
      map[item.id] = {
        id: item.id,
        cover_image_url: item.coverImage?.large || item.coverImage?.medium || null,
        title_en: item.title?.english || item.title?.romaji || null,
      }
    }
    return map
  } catch (error) {
    console.error('Failed to fetch AniList media details:', error)
    return {}
  }
}


export interface AniListAnimeOption {
  id: number;
  title: string;
  season_label: string | null;
}

/**
 * Searches AniList for anime only (no manga), for Anime of the Season
 * nominations. Returns a short label with the airing season for buttons.
 */
export async function searchAniListAnime(query: string): Promise<AniListAnimeOption[]> {
  if (!query || !query.trim()) return []

  const graphQLQuery = `
    query ($search: String) {
      Page(page: 1, perPage: 5) {
        media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
          id
          title {
            english
            romaji
          }
          season
          seasonYear
        }
      }
    }
  `

  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: graphQLQuery,
        variables: { search: query.trim() },
      }),
    })

    if (!response.ok) {
      console.error('AniList GraphQL API error response:', await response.text())
      return []
    }

    const json = await response.json()
    const media: {
      id: number
      title?: { english?: string; romaji?: string }
      season?: string | null
      seasonYear?: number | null
    }[] = json?.data?.Page?.media || []

    return media.map(item => ({
      id: item.id,
      title: item.title?.english || item.title?.romaji || 'Unknown Title',
      season_label: item.season && item.seasonYear
        ? `${item.season.charAt(0)}${item.season.slice(1).toLowerCase()} ${item.seasonYear}`
        : null,
    }))
  } catch (error) {
    console.error('Failed to query AniList GraphQL API:', error)
    return []
  }
}

export interface AniListAnimeDetail {
  id: number;
  title: string;
  image_url: string | null;
  accent_hex: string | null;
}

/**
 * Fetches the title, cover art and AniList's dominant cover colour for one
 * anime, used to render a nomination in the homepage hero.
 */
export async function fetchAniListAnime(id: number): Promise<AniListAnimeDetail | null> {
  const graphQLQuery = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        title {
          english
          romaji
        }
        coverImage {
          extraLarge
          large
          color
        }
        bannerImage
      }
    }
  `

  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: graphQLQuery,
        variables: { id },
      }),
    })

    if (!response.ok) {
      console.error('AniList GraphQL API error during anime fetch')
      return null
    }

    const json = await response.json()
    const media = json?.data?.Media
    if (!media) return null

    const color: string | null = media.coverImage?.color || null
    return {
      id: media.id,
      title: media.title?.english || media.title?.romaji || 'Unknown Title',
      image_url: media.coverImage?.extraLarge || media.coverImage?.large || media.bannerImage || null,
      accent_hex: color && /^#[0-9A-Fa-f]{6}$/.test(color) ? color : null,
    }
  } catch (error) {
    console.error('Failed to fetch AniList anime:', error)
    return null
  }
}
