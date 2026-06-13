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
