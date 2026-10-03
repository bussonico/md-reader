'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SupabaseBook } from '@/lib/db'
import BookCard from './BookCard'

interface BookGridProps {
  books: SupabaseBook[]
  userId: string | null
  onDelete: (id: string) => void
  onTogglePublic?: (id: string, isPublic: boolean) => void
}

export default function BookGrid({ books, userId, onDelete, onTogglePublic }: BookGridProps) {
  const [progressMap, setProgressMap] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!userId || books.length === 0) return
    const supabase = createClient()
    supabase
      .from('reading_progress')
      .select('book_id, ratio')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, number> = {}
        data.forEach((p) => { map[p.book_id] = p.ratio })
        setProgressMap(map)
      })
  }, [userId, books.length])

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-5xl mb-4">📖</div>
        <h2 className="text-lg font-semibold text-neutral-700 mb-1">Tu biblioteca está vacía</h2>
        <p className="text-sm text-neutral-500">Importa un archivo .md o .pdf para comenzar a leer</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          progress={progressMap[book.id]}
          userId={userId}
          onDelete={onDelete}
          onTogglePublic={onTogglePublic}
        />
      ))}
    </div>
  )
}
