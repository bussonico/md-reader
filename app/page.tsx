'use client'

import { useEffect, useState } from 'react'
import { useBooks } from '@/hooks/useBooks'
import { useUser } from '@/hooks/useSupabase'
import BookGrid from '@/components/library/BookGrid'
import ImportButton from '@/components/library/ImportButton'
import { createClient } from '@/lib/supabase/client'
import { extractTitle } from '@/lib/markdown'
import { generateCoverGradient } from '@/lib/colors'

export default function LibraryPage() {
  const { user, loading: userLoading } = useUser()
  const { books, loading: booksLoading, importBook, deleteBook, togglePublic } = useBooks(user?.id ?? null)
  const [seeded, setSeeded] = useState(false)

  // Seed sample books only once per user (flag stored in localStorage)
  useEffect(() => {
    if (!user || seeded || booksLoading) return
    const seedKey = `md-reader-seeded-${user.id}`
    if (localStorage.getItem(seedKey)) { setSeeded(true); return }
    if (books.length > 0) { localStorage.setItem(seedKey, '1'); setSeeded(true); return }

    const seed = async () => {
      const SAMPLES = [
        '/samples/grinberg.md',
      ]
      try {
        for (const file of SAMPLES) {
          const content = await fetch(file).then((r) => r.text())
          const title = extractTitle(content)
          const supabase = createClient()
          const { count } = await supabase
            .from('books')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', user.id)
            .eq('title', title)
          if ((count ?? 0) === 0) {
            const { gradient } = generateCoverGradient(title)
            await supabase.from('books').insert({
              owner_id: user.id,
              title,
              content_md: content,
              is_public: false,
              cover_gradient: { gradient },
            })
          }
        }
      } catch (e) {
        console.warn('Could not load sample books', e)
      }
      localStorage.setItem(seedKey, '1')
      setSeeded(true)
    }
    seed()
  }, [user, books.length, booksLoading, seeded])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (userLoading) {
    return (
      <div style={{ minHeight: '100dvh', backgroundColor: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="w-6 h-6 border-2 border-neutral-700 border-t-neutral-300 rounded-full animate-spin" />
      </div>
    )
  }

  const isLoading = booksLoading || (!seeded && books.length === 0)

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-neutral-900 tracking-tight">MD Reader</h1>
            <p className="text-xs text-neutral-500">
              {books.length} {books.length === 1 ? 'libro' : 'libros'}
              {user && <span className="ml-2 text-neutral-400">· {user.email}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ImportButton onImport={importBook} />
            <button
              onClick={handleSignOut}
              className="px-3 py-2 text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Library grid */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-700 rounded-full animate-spin" />
          </div>
        ) : (
          <BookGrid
            books={books}
            userId={user?.id ?? null}
            onDelete={deleteBook}
            onTogglePublic={togglePublic}
          />
        )}
      </main>
    </div>
  )
}
