export interface TocEntry {
  level: number
  text: string
  id: string
  index: number // heading occurrence index
}

export function extractToc(content: string): TocEntry[] {
  const headingRegex = /^#{1,3}\s+(.+)$/gm
  const entries: TocEntry[] = []
  let match
  let index = 0
  while ((match = headingRegex.exec(content)) !== null) {
    const raw = match[1].trim()
    const level = match[0].indexOf(' ')
    const id = raw
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
    entries.push({ level, text: raw, id, index: index++ })
  }
  return entries
}

export function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m)
  if (match) return match[1].trim()
  // fallback: first non-empty line
  const lines = content.split('\n').filter((l) => l.trim())
  return lines[0]?.replace(/^#+\s*/, '').trim() || 'Sin título'
}

export interface SearchResult {
  pageHint: number // character offset, used to find page
  context: string
  charOffset: number
}

export function searchContent(content: string, query: string, maxResults = 10): SearchResult[] {
  if (!query.trim()) return []
  const lower = content.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const results: SearchResult[] = []
  let offset = 0
  while (results.length < maxResults) {
    const idx = lower.indexOf(lowerQuery, offset)
    if (idx === -1) break
    const start = Math.max(0, idx - 50)
    const end = Math.min(content.length, idx + query.length + 50)
    const context = content.slice(start, end)
    results.push({ pageHint: idx, context, charOffset: idx })
    offset = idx + 1
  }
  return results
}
