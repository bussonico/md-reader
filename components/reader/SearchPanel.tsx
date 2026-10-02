'use client'

import { useState } from 'react'
import BottomSheet from '@/components/shared/BottomSheet'
import { searchContent, SearchResult } from '@/lib/markdown'

interface SearchPanelProps {
  open: boolean
  onClose: () => void
  content: string
  onNavigate: (charOffset: number) => void
}

export default function SearchPanel({ open, onClose, content, onNavigate }: SearchPanelProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])

  const handleSearch = (q: string) => {
    setQuery(q)
    if (q.trim().length < 2) {
      setResults([])
      return
    }
    setResults(searchContent(content, q))
  }

  const highlight = (text: string, q: string) => {
    if (!q.trim()) return text
    const idx = text.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return text
    return (
      text.slice(0, idx) +
      `<mark class="bg-yellow-200 dark:bg-yellow-700 rounded px-0.5">${text.slice(idx, idx + q.length)}</mark>` +
      text.slice(idx + q.length)
    )
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Buscar en el libro">
      <div className="space-y-3">
        <input
          type="search"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Escribe para buscar..."
          className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
          autoFocus
        />
        {query.trim().length >= 2 && results.length === 0 && (
          <p className="text-sm text-neutral-500 py-2 text-center">Sin resultados para &ldquo;{query}&rdquo;</p>
        )}
        <ul className="space-y-2">
          {results.map((r, i) => (
            <li key={i}>
              <button
                onClick={() => {
                  onNavigate(r.charOffset)
                  onClose()
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <p
                  className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: '...' + highlight(r.context, query) + '...' }}
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </BottomSheet>
  )
}
