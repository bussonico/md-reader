'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useSupabase'
import { useHighlights } from '@/hooks/useHighlights'
import { SupabaseBook } from '@/lib/db'

const COLOR_DOTS: Record<string, string> = {
  yellow: '#FFE600',
  orange: '#FF8C00',
  green: '#32CD32',
  pink: '#FF69B4',
}

export default function NotesPage() {
  const params = useParams()
  const router = useRouter()
  const bookId = params.id as string

  const { user } = useUser()
  const [book, setBook] = useState<SupabaseBook | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  const { highlights, updateHighlight, deleteHighlight } = useHighlights(bookId, user?.id ?? null)

  useEffect(() => {
    if (!bookId) return
    const supabase = createClient()
    supabase
      .from('books')
      .select('id, title, owner_id, is_public, cover_gradient, created_at, updated_at, content_md')
      .eq('id', bookId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true)
        else setBook(data)
      })
  }, [bookId])

  const handleSaveNote = useCallback(
    async (id: string) => {
      await updateHighlight(id, { note: editText })
      setEditingId(null)
      setEditText('')
    },
    [updateHighlight, editText]
  )

  // Sort by page
  const sorted = [...highlights].sort((a, b) =>
    a.page_index !== b.page_index ? a.page_index - b.page_index : a.char_start - b.char_start
  )

  // Group by page
  const grouped: Record<number, typeof sorted> = {}
  sorted.forEach((h) => {
    if (!grouped[h.page_index]) grouped[h.page_index] = []
    grouped[h.page_index].push(h)
  })
  const pages = Object.keys(grouped).map(Number).sort((a, b) => a - b)

  if (notFound) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#666', marginBottom: 16 }}>Libro no encontrado</p>
          <Link href="/" style={{ color: '#2563eb', fontSize: 14 }}>Volver a la biblioteca</Link>
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa' }}>
        <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-700 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: '#fafafa' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e5e5', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => router.push(`/read/${bookId}`)}
            style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: 'none', backgroundColor: '#f0f0f0', cursor: 'pointer', color: '#333' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Mis notas
            </h1>
            <p style={{ fontSize: 12, color: '#9A9A9A', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {book.title}
            </p>
          </div>
          <span style={{ fontSize: 12, color: '#9A9A9A', whiteSpace: 'nowrap' }}>
            {highlights.length} {highlights.length === 1 ? 'nota' : 'notas'}
          </span>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
        {highlights.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#9A9A9A' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#555', marginBottom: 8 }}>Sin notas todavía</p>
            <p style={{ fontSize: 13, margin: '0 0 24px' }}>
              Mantén presionado un texto mientras lees para resaltar o agregar una nota.
            </p>
            <Link
              href={`/read/${bookId}`}
              style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: '#1a1a1a', color: 'white', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
            >
              Ir a leer
            </Link>
          </div>
        ) : (
          pages.map((pageIndex) => (
            <div key={pageIndex} style={{ marginBottom: 32 }}>
              {/* Chapter header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ height: 1, flex: 1, backgroundColor: '#e5e5e5' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#9A9A9A', textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>
                  Página {pageIndex + 1}
                </span>
                <div style={{ height: 1, flex: 1, backgroundColor: '#e5e5e5' }} />
              </div>

              {grouped[pageIndex].map((h) => (
                <div
                  key={h.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    border: '1px solid #e5e5e5',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  {/* Colored dot + excerpt */}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: h.note || editingId === h.id ? 10 : 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: COLOR_DOTS[h.color] ?? COLOR_DOTS.yellow, flexShrink: 0, marginTop: 4 }} />
                    <p style={{ fontSize: 14, color: '#2a2a2a', margin: 0, fontStyle: 'italic', lineHeight: 1.5, flex: 1 }}>
                      &ldquo;{h.selected_text}&rdquo;
                    </p>
                  </div>

                  {/* Note area */}
                  {editingId === h.id ? (
                    <div style={{ marginLeft: 20 }}>
                      <textarea
                        autoFocus
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        placeholder="Escribe una nota..."
                        style={{
                          width: '100%',
                          border: '1px solid #ddd',
                          borderRadius: 8,
                          padding: '8px 10px',
                          fontSize: 13,
                          resize: 'vertical',
                          outline: 'none',
                          minHeight: 60,
                          boxSizing: 'border-box',
                          color: '#333',
                          backgroundColor: '#fafafa',
                        }}
                      />
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button
                          onClick={() => handleSaveNote(h.id)}
                          style={{ padding: '6px 14px', backgroundColor: '#1a1a1a', color: 'white', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setEditText('') }}
                          style={{ padding: '6px 14px', backgroundColor: '#f0f0f0', color: '#555', borderRadius: 8, border: 'none', fontSize: 12, cursor: 'pointer' }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {h.note && (
                        <p style={{ fontSize: 13, color: '#444', margin: '0 0 8px 20px', lineHeight: 1.5 }}>
                          {h.note}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: 8, marginLeft: 20 }}>
                        <button
                          onClick={() => { setEditingId(h.id); setEditText(h.note ?? '') }}
                          style={{ fontSize: 11, color: '#9A9A9A', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}
                        >
                          {h.note ? 'Editar nota' : '+ Agregar nota'}
                        </button>
                        <span style={{ color: '#ddd' }}>·</span>
                        <button
                          onClick={() => deleteHighlight(h.id)}
                          style={{ fontSize: 11, color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}
                        >
                          Eliminar
                        </button>
                        <span style={{ color: '#ddd' }}>·</span>
                        <Link
                          href={`/read/${bookId}`}
                          style={{ fontSize: 11, color: '#9A9A9A', textDecoration: 'none' }}
                        >
                          Ver en libro
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </main>
    </div>
  )
}
