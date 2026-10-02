'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db, Book } from '@/lib/db'
import BookCard from './BookCard'

interface BookGridProps {
  books: Book[]
  onDelete: (id: number) => void
}

export default function BookGrid({ books, onDelete }: BookGridProps) {
  const progressList = useLiveQuery(() => db.progress.toArray(), [])

  const getProgress = (bookId: number) => {
    const p = progressList?.find((p) => p.bookId === bookId)
    return p?.ratio
  }

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-5xl mb-4">📖</div>
        <h2 className="text-lg font-semibold text-neutral-700 mb-1">Tu biblioteca está vacía</h2>
        <p className="text-sm text-neutral-500">Importa un archivo .md para comenzar a leer</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          progress={getProgress(book.id!)}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
