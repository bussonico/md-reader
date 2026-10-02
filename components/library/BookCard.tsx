'use client'

import Link from 'next/link'
import { Book } from '@/lib/db'
import { getTextColorForBg } from '@/lib/colors'

interface BookCardProps {
  book: Book
  progress?: number // 0-1
  onDelete: (id: number) => void
}

export default function BookCard({ book, progress, onDelete }: BookCardProps) {
  const textColor = getTextColorForBg(book.coverColor)
  const percent = progress !== undefined ? Math.round(progress * 100) : 0

  return (
    <div className="group relative flex flex-col">
      <Link href={`/read/${book.id}`}>
        {/* Cover */}
        <div
          className="relative w-full rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
          style={{ aspectRatio: '3/4', backgroundColor: book.coverColor }}
        >
          {/* Title on cover */}
          <div className="absolute inset-0 flex flex-col justify-end p-3">
            <p
              className="text-sm font-bold leading-tight line-clamp-3"
              style={{ color: textColor }}
            >
              {book.title}
            </p>
          </div>
          {/* Progress bar */}
          {progress !== undefined && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
              <div
                className="h-full bg-white/70 transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          )}
        </div>
      </Link>
      {/* Book info */}
      <div className="mt-2 px-0.5">
        <p className="text-xs font-medium text-neutral-800 truncate">{book.title}</p>
        {progress !== undefined && progress > 0 && (
          <p className="text-xs text-neutral-500">{percent}% leido</p>
        )}
      </div>
      {/* Delete button */}
      <button
        onClick={(e) => {
          e.preventDefault()
          if (confirm(`¿Eliminar "${book.title}"?`)) {
            onDelete(book.id!)
          }
        }}
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
        aria-label="Eliminar libro"
      >
        ×
      </button>
    </div>
  )
}
