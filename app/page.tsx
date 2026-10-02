'use client'

import { useEffect, useState } from 'react'
import { useBooks } from '@/hooks/useBooks'
import BookGrid from '@/components/library/BookGrid'
import ImportButton from '@/components/library/ImportButton'
import { db } from '@/lib/db'
import { extractTitle } from '@/lib/markdown'
import { generateCoverColor } from '@/lib/colors'

export default function LibraryPage() {
  const { books, importBook, deleteBook } = useBooks()
  const [initialized, setInitialized] = useState(false)

  // Seed sample books (checks by title so it's safe to run multiple times)
  useEffect(() => {
    const init = async () => {
      const SAMPLES = [
        { file: '/samples/sample1.md', offset: 2000 },
        { file: '/samples/sample2.md', offset: 1000 },
        { file: '/samples/grinberg.md', offset: 0 },
      ]
      try {
        for (const { file, offset } of SAMPLES) {
          const content = await fetch(file).then((r) => r.text())
          const title = extractTitle(content)
          const exists = await db.books.where('title').equals(title).count()
          if (exists === 0) {
            await db.books.add({
              title,
              content,
              importedAt: new Date(Date.now() - offset),
              coverColor: generateCoverColor(title),
            })
          }
        }
      } catch (e) {
        console.warn('Could not load sample books', e)
      }
      setInitialized(true)
    }
    init()
  }, [])

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-neutral-900 tracking-tight">MD Reader</h1>
            <p className="text-xs text-neutral-500">{books.length} {books.length === 1 ? 'libro' : 'libros'}</p>
          </div>
          <ImportButton onImport={importBook} />
        </div>
      </header>

      {/* Library grid */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {initialized ? (
          <BookGrid books={books} onDelete={deleteBook} />
        ) : (
          <div className="flex items-center justify-center py-32">
            <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-700 rounded-full animate-spin" />
          </div>
        )}
      </main>
    </div>
  )
}
