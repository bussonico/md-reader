'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db, Bookmark } from '@/lib/db'
import BottomSheet from '@/components/shared/BottomSheet'

interface BookmarksPanelProps {
  open: boolean
  onClose: () => void
  bookId: number
  onNavigate: (pageIndex: number) => void
  onAddBookmark: () => void
}

export default function BookmarksPanel({
  open,
  onClose,
  bookId,
  onNavigate,
  onAddBookmark,
}: BookmarksPanelProps) {
  const bookmarks = useLiveQuery(
    () => db.bookmarks.where('bookId').equals(bookId).sortBy('pageIndex'),
    [bookId]
  )

  const deleteBookmark = async (id: number) => {
    await db.bookmarks.delete(id)
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Marcadores">
      <div className="space-y-3">
        <button
          onClick={() => {
            onAddBookmark()
            onClose()
          }}
          className="w-full py-2.5 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-600 text-sm text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 transition-colors"
        >
          + Añadir marcador en esta página
        </button>
        {(!bookmarks || bookmarks.length === 0) ? (
          <p className="text-sm text-neutral-500 py-4 text-center">Sin marcadores todavía</p>
        ) : (
          <ul className="space-y-2">
            {bookmarks.map((bm) => (
              <li key={bm.id} className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onNavigate(bm.pageIndex)
                    onClose()
                  }}
                  className="flex-1 text-left px-3 py-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Página {bm.pageIndex + 1}
                  </p>
                  {bm.text && (
                    <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">{bm.text}</p>
                  )}
                </button>
                <button
                  onClick={() => deleteBookmark(bm.id!)}
                  className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
                  aria-label="Eliminar marcador"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </BottomSheet>
  )
}
