/**
 * Strips MDX/Markdown formatting, images, headings, links, and HTML to produce a clean text excerpt.
 */
export function getExcerpt(content: string, length = 140, postTitle?: string): string {
  if (!content) return ''

  let clean = content

  // 1. Remove markdown images: ![alt](url)
  clean = clean.replace(/!\[.*?\]\(.*?\)/g, '')

  // 2. Remove HTML images and tags like <img ... />
  clean = clean.replace(/<img\s+[^>]*\/?>/gi, '')

  // 3. Remove block code blocks: ```...```
  clean = clean.replace(/```[\s\S]*?```/g, '')

  // 4. Remove headings: # Heading
  clean = clean.replace(/^#+\s+.*$/gm, '')

  // 5. Convert markdown links [text](url) to just text
  clean = clean.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')

  // 6. Remove HTML tags
  clean = clean.replace(/<\/?[^>]+(>|$)/g, '')

  // 7. Remove markdown formatting characters: * _ ~ ` >
  clean = clean.replace(/[*_`~>]/g, '')

  // 8. Collapse whitespace and newlines
  clean = clean.replace(/\s+/g, ' ').trim()

  // 9. If the excerpt starts with the exact post title (common in posts starting with title), strip it
  if (postTitle) {
    const titleClean = postTitle.trim()
    if (clean.toLowerCase().startsWith(titleClean.toLowerCase())) {
      clean = clean.slice(titleClean.length).trim()
      // Trim leftover leading punctuation like !, :, -, .
      clean = clean.replace(/^[!:\-–—.\s]+/, '')
    }
  }

  if (clean.length <= length) {
    return clean
  }

  // Slice to desired length and cut nicely at a word boundary
  const sliced = clean.slice(0, length)
  const lastSpace = sliced.lastIndexOf(' ')
  if (lastSpace > length * 0.7) {
    return sliced.slice(0, lastSpace).trim() + '...'
  }
  return sliced.trim() + '...'
}
