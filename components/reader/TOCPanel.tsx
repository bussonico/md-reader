'use client'

import BottomSheet from '@/components/shared/BottomSheet'
import { TocEntry } from '@/lib/markdown'

interface TOCPanelProps {
  open: boolean
  onClose: () => void
  entries: TocEntry[]
  onNavigate: (entryIndex: number) => void
  currentPage: number
}

export default function TOCPanel({ open, onClose, entries, onNavigate, currentPage }: TOCPanelProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Tabla de contenidos">
      {entries.length === 0 ? (
        <p className="text-sm text-neutral-500 py-4 text-center">Sin encabezados encontrados</p>
      ) : (
        <ul className="space-y-1">
          {entries.map((entry, i) => (
            <li key={i}>
              <button
                onClick={() => {
                  onNavigate(i)
                  onClose()
                }}
                className={`w-full text-left py-2.5 px-3 rounded-lg text-sm transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                  entry.level === 1
                    ? 'font-semibold text-neutral-900 dark:text-neutral-100'
                    : entry.level === 2
                    ? 'pl-6 text-neutral-700 dark:text-neutral-300'
                    : 'pl-10 text-neutral-500 dark:text-neutral-400 text-xs'
                }`}
              >
                {entry.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </BottomSheet>
  )
}
