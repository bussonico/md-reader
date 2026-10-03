'use client'

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
  onAddBookmark,
}: BookmarksPanelProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Marcadores">
      <div className="space-y-3">
        <button
          onClick={() => {
            onAddBookmark()
            onClose()
          }}
          className="w-full py-2.5 rounded-xl border-2 border-dashed border-neutral-300 text-sm text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 transition-colors"
        >
          Ver notas y resaltados
        </button>
        <p className="text-sm text-neutral-500 py-4 text-center">
          Los marcadores han sido reemplazados por el panel de notas y resaltados.
        </p>
      </div>
    </BottomSheet>
  )
}
