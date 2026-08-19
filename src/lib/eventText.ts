/**
 * Plain-text helpers for event copy. Kept out of `lib/events.ts` so client
 * components can use them without pulling in the server-only Supabase client.
 */
/** Keeps the first `count` whitespace-separated words, separators intact. */
function takeWords(block: string, count: number): string {
  const words = /\S+/g
  let seen = 0
  let end = 0
  let match: RegExpExecArray | null
  while ((match = words.exec(block)) !== null) {
    seen += 1
    end = match.index + match[0].length
    if (seen >= count) break
  }
  return block.slice(0, end)
}

/**
 * Preview copy for the hero and event cards. Descriptions are plain text that
 * authors write with real line and paragraph breaks, so previews render with
 * `whitespace-pre-line` and this keeps that shape rather than flattening it —
 * while capping how much of a long write-up leaks into a summary slot.
 */
export function eventPreviewText(
  description: string | null | undefined,
  { maxWords = 26, maxBlocks = 2 }: { maxWords?: number; maxBlocks?: number } = {}
): string | null {
  if (!description) return null

  // Normalise line endings and drop runs of blank lines so one stray double
  // break in the source can't blow out the preview's height.
  const blocks = description
    .replace(/\r\n?/g, '\n')
    .split(/\n{2,}/)
    .map((block) =>
      block
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .join('\n')
    )
    .filter(Boolean)

  if (blocks.length === 0) return null

  const kept: string[] = []
  let budget = maxWords
  let truncated = blocks.length > maxBlocks

  for (const block of blocks.slice(0, maxBlocks)) {
    if (budget <= 0) {
      truncated = true
      break
    }
    const wordCount = (block.match(/\S+/g) ?? []).length
    if (wordCount <= budget) {
      kept.push(block)
      budget -= wordCount
      continue
    }
    kept.push(takeWords(block, budget))
    budget = 0
    truncated = true
  }

  if (kept.length === 0) return null

  const text = kept.join('\n\n')
  return truncated ? `${text.replace(/[\s,;:.!?-]+$/, '')}…` : text
}
