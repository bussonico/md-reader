'use client'

import { SupabaseHighlight } from '@/lib/db'
import BottomSheet from '@/components/shared/BottomSheet'

interface NotesPanelProps {
  open: boolean
  onClose: () => void
  bookTitle: string
  highlights: SupabaseHighlight[]
  onNavigate: (pageIndex: number) => void
  onDelete: (id: string) => void
}

const COLOR_DOTS: Record<string, string> = {
  yellow: '#FFE600',
  orange: '#FF8C00',
  green: '#32CD32',
  pink: '#FF69B4',
}

export default function NotesPanel({
  open,
  onClose,
  bookTitle,
  highlights,
  onNavigate,
  onDelete,
}: NotesPanelProps) {
  // Sort by page, then by char_start
  const sorted = [...highlights].sort((a, b) =>
    a.page_index !== b.page_index ? a.page_index - b.page_index : a.char_start - b.char_start
  )

  // Group by page
  const grouped: Record<number, SupabaseHighlight[]> = {}
  sorted.forEach((h) => {
    if (!grouped[h.page_index]) grouped[h.page_index] = []
    grouped[h.page_index].push(h)
  })

  const pages = Object.keys(grouped).map(Number).sort((a, b) => a - b)

  return (
    <BottomSheet open={open} onClose={onClose} title={`Mis notas — ${bookTitle}`}>
      <div style={{ paddingBottom: 16 }}>
        {highlights.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#9A9A9A' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📝</div>
            <p style={{ fontSize: 14, margin: 0 }}>Sin notas todavía</p>
            <p style={{ fontSize: 12, marginTop: 4, color: '#666' }}>
              Mantén presionado un texto para resaltar
            </p>
          </div>
        ) : (
          pages.map((pageIndex) => (
            <div key={pageIndex} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                Página {pageIndex + 1}
              </div>
              {grouped[pageIndex].map((h) => (
                <div
                  key={h.id}
                  style={{
                    display: 'flex',
                    gap: 10,
                    padding: '10px 0',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  {/* Color dot */}
                  <div style={{ paddingTop: 3 }}>
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: COLOR_DOTS[h.color] ?? COLOR_DOTS.yellow,
                        flexShrink: 0,
                      }}
                    />
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <button
                      onClick={() => { onNavigate(pageIndex); onClose() }}
                      style={{
                        display: 'block',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        width: '100%',
                      }}
                    >
                      <p style={{
                        fontSize: 13,
                        color: '#2a2a2a',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontStyle: 'italic',
                      }}>
                        &ldquo;{h.selected_text.length > 60 ? h.selected_text.slice(0, 60) + '…' : h.selected_text}&rdquo;
                      </p>
                    </button>
                    {h.note && (
                      <p style={{ fontSize: 12, color: '#555', margin: '4px 0 0', lineHeight: 1.4 }}>
                        {h.note}
                      </p>
                    )}
                  </div>
                  {/* Delete */}
                  <button
                    onClick={() => onDelete(h.id)}
                    style={{
                      color: '#ccc',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 16,
                      padding: '0 4px',
                      flexShrink: 0,
                    }}
                    aria-label="Eliminar nota"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </BottomSheet>
  )
}
