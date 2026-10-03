'use client'

import Link from 'next/link'
import { SupabaseBook } from '@/lib/db'
import { generateCoverGradient } from '@/lib/colors'

interface BookCardProps {
  book: SupabaseBook
  progress?: number // 0-1
  userId: string | null
  onDelete: (id: string) => void
  onTogglePublic?: (id: string, isPublic: boolean) => void
}

export default function BookCard({ book, progress, userId, onDelete, onTogglePublic }: BookCardProps) {
  const isOwner = userId === book.owner_id
  const percent = progress !== undefined ? Math.round(progress * 100) : 0

  // Get gradient: stored or computed
  const gradient =
    (book.cover_gradient as Record<string, string>)?.gradient ??
    generateCoverGradient(book.title).gradient

  // Decorative shapes based on title hash
  let hash = 0
  for (let i = 0; i < book.title.length; i++) {
    hash = (hash * 31 + book.title.charCodeAt(i)) & 0xffffffff
  }
  const cx = 60 + (Math.abs(hash) % 60)
  const cy = 20 + (Math.abs(hash >> 4) % 40)
  const r = 50 + (Math.abs(hash >> 8) % 50)

  return (
    <div className="group relative flex flex-col">
      <Link href={`/read/${book.id}`}>
        {/* Cover */}
        <div
          className="relative w-full rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:scale-[1.02]"
          style={{ aspectRatio: '3/4', background: gradient }}
        >
          {/* Decorative SVG overlay */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 133"
            preserveAspectRatio="xMidYMid slice"
          >
            <circle cx={cx} cy={cy} r={r} fill="white" opacity="0.08" />
            <circle cx={cx - 30} cy={cy + 60} r={r * 0.5} fill="white" opacity="0.06" />
            <line x1="0" y1="133" x2="100" y2="0" stroke="white" strokeWidth="0.5" opacity="0.1" />
            <line x1="20" y1="133" x2="100" y2="20" stroke="white" strokeWidth="0.3" opacity="0.07" />
          </svg>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1">
            {isOwner && book.is_public && (
              <span style={{ fontSize: 10, backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: 6, padding: '2px 6px' }}>
                Público
              </span>
            )}
          </div>

          {/* Dark gradient overlay at bottom */}
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              height: '60%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)',
            }}
          />

          {/* Title */}
          <div className="absolute inset-x-0 bottom-0 p-3">
            <p
              className="text-sm font-bold leading-tight line-clamp-3"
              style={{ color: '#FFFFFF', fontFamily: 'Georgia, serif' }}
            >
              {book.title}
            </p>
            {isOwner && !book.is_public && (
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', display: 'block', marginTop: 2 }}>
                Solo yo
              </span>
            )}
            {!isOwner && (
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', display: 'block', marginTop: 2 }}>
                Compartido
              </span>
            )}
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

      {/* Book info below card */}
      <div className="mt-2 px-0.5">
        <p className="text-xs font-medium text-neutral-800 truncate">{book.title}</p>
        {progress !== undefined && progress > 0 && (
          <p className="text-xs text-neutral-500">{percent}% leído</p>
        )}
      </div>

      {/* Action buttons (visible on hover) */}
      <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.preventDefault()
            if (confirm(`¿Eliminar "${book.title}"?`)) {
              onDelete(book.id)
            }
          }}
          className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center text-xs hover:bg-red-600/80"
          aria-label="Eliminar libro"
        >
          ×
        </button>
        {isOwner && onTogglePublic && (
          <button
            onClick={(e) => {
              e.preventDefault()
              onTogglePublic(book.id, !book.is_public)
            }}
            className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center text-xs hover:bg-black/80"
            aria-label={book.is_public ? 'Hacer privado' : 'Hacer público'}
            title={book.is_public ? 'Hacer privado' : 'Compartir'}
          >
            {book.is_public ? '🔒' : '🌐'}
          </button>
        )}
      </div>
    </div>
  )
}
