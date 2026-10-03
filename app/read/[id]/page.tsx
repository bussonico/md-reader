'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useSupabase'
import { useSettings } from '@/hooks/useSettings'
import { useProgress } from '@/hooks/useProgress'
import { useHighlights } from '@/hooks/useHighlights'
import { extractToc, TocEntry } from '@/lib/markdown'
import { SupabaseBook } from '@/lib/db'
import PagedReader from '@/components/reader/PagedReader'
import ReaderUI from '@/components/reader/ReaderUI'
import TOCPanel from '@/components/reader/TOCPanel'
import SearchPanel from '@/components/reader/SearchPanel'
import BookmarksPanel from '@/components/reader/BookmarksPanel'
import NotesPanel from '@/components/reader/NotesPanel'
import SettingsSheet from '@/components/settings/SettingsSheet'

export default function ReadPage() {
  const params = useParams()
  const bookId = params.id as string

  const { user } = useUser()
  const [book, setBook] = useState<SupabaseBook | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [uiVisible, setUiVisible] = useState(true)
  const [tocOpen, setTocOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [bookmarksOpen, setBookmarksOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [toc, setToc] = useState<TocEntry[]>([])
  const [charOffsetToJump, setCharOffsetToJump] = useState<number | null>(null)
  const restoredRef = useRef(false)

  const { settings, updateSettings, loaded: settingsLoaded } = useSettings()
  const { progress, saveProgress, restorePage } = useProgress(bookId, user?.id ?? null)
  const { highlights, addHighlight, deleteHighlight } = useHighlights(bookId, user?.id ?? null)

  // Load book from Supabase
  useEffect(() => {
    if (!bookId) return
    const supabase = createClient()
    supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true)
        } else {
          setBook(data)
          setToc(extractToc(data.content_md))
        }
      })
  }, [bookId])

  // Restore progress once totalPages is known
  useEffect(() => {
    if (restoredRef.current || totalPages <= 1 || !progress) return
    restoredRef.current = true
    const restored = restorePage(totalPages)
    setCurrentPage(restored)
  }, [totalPages, progress, restorePage])

  // Save progress on page change
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page)
      saveProgress(page, totalPages)
    },
    [totalPages, saveProgress]
  )

  const handleTotalPages = useCallback((total: number) => {
    setTotalPages(total)
  }, [])

  // TOC navigation: find page for heading by searching char offsets
  const handleTocNavigate = useCallback(
    (entryIndex: number) => {
      if (!book) return
      const headingRegex = /^#{1,3}\s+.+$/gm
      let idx = 0
      let match
      const re = new RegExp(headingRegex)
      while ((match = re.exec(book.content_md)) !== null) {
        if (idx === entryIndex) {
          setCharOffsetToJump(match.index)
          return
        }
        idx++
      }
    },
    [book]
  )

  // Add bookmark (using Supabase - stored in highlights with special flag, or keep using local)
  const handleAddBookmark = useCallback(async () => {
    if (!book || !user) return
    // For now, just navigate to notes panel as bookmarks are replaced by highlights
    setNotesOpen(true)
  }, [book, user])

  // Toggle UI on center tap
  const handleCenterTap = useCallback(() => {
    setUiVisible((v) => !v)
  }, [])

  // Reset charOffset after jump
  useEffect(() => {
    if (charOffsetToJump !== null) {
      const t = setTimeout(() => setCharOffsetToJump(null), 500)
      return () => clearTimeout(t)
    }
  }, [charOffsetToJump])

  const handleAddHighlight = useCallback(
    (text: string, color: string, note: string, pageIndex: number, charStart: number, charEnd: number) => {
      addHighlight({
        selected_text: text,
        note,
        color,
        page_index: pageIndex,
        char_start: charStart,
        char_end: charEnd,
      })
    },
    [addHighlight]
  )

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-lg font-semibold text-neutral-700">Libro no encontrado</p>
        <a href="/" className="text-sm text-blue-600 underline">
          Volver a la biblioteca
        </a>
      </div>
    )
  }

  if (!book || !settingsLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-700 rounded-full animate-spin" />
      </div>
    )
  }

  const THEME_BG: Record<string, string> = {
    Claro: '#FFFFFF',
    Sepia: '#F4ECD8',
    Oscuro: '#1c1c1e',
    Negro: '#000000',
    Naranja: '#1A0F00',
  }

  return (
    <div
      style={{
        height: '100dvh',
        overflow: 'hidden',
        backgroundColor: THEME_BG[settings.theme] ?? '#FFFFFF',
      }}
    >
      <ReaderUI
        visible={uiVisible}
        title={book.title}
        currentPage={currentPage}
        totalPages={totalPages}
        theme={settings.theme}
        onToggleTOC={() => setTocOpen(true)}
        onToggleSearch={() => setSearchOpen(true)}
        onToggleBookmarks={() => setNotesOpen(true)}
        onToggleSettings={() => setSettingsOpen(true)}
      />

      <div style={{ paddingTop: 56 }}>
        <PagedReader
          content={book.content_md}
          settings={settings}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onTotalPages={handleTotalPages}
          onToggleUI={handleCenterTap}
          charOffsetToJump={charOffsetToJump}
          highlights={highlights}
          onAddHighlight={handleAddHighlight}
        />
      </div>

      <TOCPanel
        open={tocOpen}
        onClose={() => setTocOpen(false)}
        entries={toc}
        onNavigate={handleTocNavigate}
        currentPage={currentPage}
      />

      <SearchPanel
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        content={book.content_md}
        onNavigate={(offset) => setCharOffsetToJump(offset)}
      />

      <BookmarksPanel
        open={bookmarksOpen}
        onClose={() => setBookmarksOpen(false)}
        bookId={bookId as unknown as number}
        onNavigate={handlePageChange}
        onAddBookmark={handleAddBookmark}
      />

      <NotesPanel
        open={notesOpen}
        onClose={() => setNotesOpen(false)}
        bookTitle={book.title}
        highlights={highlights}
        onNavigate={(pageIndex) => { handlePageChange(pageIndex); setNotesOpen(false) }}
        onDelete={deleteHighlight}
      />

      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onChange={updateSettings}
      />
    </div>
  )
}
