'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { db, Book } from '@/lib/db'
import { useSettings } from '@/hooks/useSettings'
import { useProgress } from '@/hooks/useProgress'
import { extractToc, TocEntry } from '@/lib/markdown'
import PagedReader from '@/components/reader/PagedReader'
import ReaderUI from '@/components/reader/ReaderUI'
import TOCPanel from '@/components/reader/TOCPanel'
import SearchPanel from '@/components/reader/SearchPanel'
import BookmarksPanel from '@/components/reader/BookmarksPanel'
import SettingsSheet from '@/components/settings/SettingsSheet'

export default function ReadPage() {
  const params = useParams()
  const bookId = Number(params.id)

  const [book, setBook] = useState<Book | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [uiVisible, setUiVisible] = useState(true)
  const [tocOpen, setTocOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [bookmarksOpen, setBookmarksOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [toc, setToc] = useState<TocEntry[]>([])
  const [charOffsetToJump, setCharOffsetToJump] = useState<number | null>(null)
  const [tocPageMap, setTocPageMap] = useState<number[]>([])
  const tocPageMapRef = useRef<number[]>([])
  const restoredRef = useRef(false)

  const { settings, updateSettings, loaded: settingsLoaded } = useSettings()
  const { progress, saveProgress, restorePage } = useProgress(bookId)

  // Load book
  useEffect(() => {
    if (!bookId) return
    db.books.get(bookId).then((b) => {
      if (b) {
        setBook(b)
        setToc(extractToc(b.content))
      } else {
        setNotFound(true)
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

  const handleTotalPages = useCallback(
    (total: number) => {
      setTotalPages(total)
    },
    []
  )

  // TOC navigation: find page for heading by searching char offsets
  const handleTocNavigate = useCallback(
    (entryIndex: number) => {
      if (!book) return
      // Collect headings in order
      const headingRegex = /^#{1,3}\s+.+$/gm
      let idx = 0
      let match
      const re = new RegExp(headingRegex)
      while ((match = re.exec(book.content)) !== null) {
        if (idx === entryIndex) {
          setCharOffsetToJump(match.index)
          return
        }
        idx++
      }
    },
    [book]
  )

  // Add bookmark
  const handleAddBookmark = useCallback(async () => {
    if (!book) return
    await db.bookmarks.add({
      bookId: book.id!,
      pageIndex: currentPage,
      text: `Página ${currentPage + 1}`,
      note: '',
      createdAt: new Date(),
    })
  }, [book, currentPage])

  // Toggle UI on center tap (handled in PagedReader tap, but also handle here)
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
        onToggleBookmarks={() => setBookmarksOpen(true)}
        onToggleSettings={() => setSettingsOpen(true)}
      />

      {/* Tap zones overlay */}
      <div
        style={{
          position: 'fixed',
          top: 56,
          left: 0,
          right: 0,
          bottom: 56,
          zIndex: 10,
          display: 'flex',
        }}
      >
        {/* Left tap zone */}
        <div
          style={{ width: '35%', height: '100%', cursor: 'pointer' }}
          onClick={() => {
            if (currentPage > 0) handlePageChange(currentPage - 1)
          }}
        />
        {/* Center tap zone */}
        <div
          style={{ flex: 1, height: '100%', cursor: 'pointer' }}
          onClick={handleCenterTap}
        />
        {/* Right tap zone */}
        <div
          style={{ width: '35%', height: '100%', cursor: 'pointer' }}
          onClick={() => {
            if (currentPage < totalPages - 1) handlePageChange(currentPage + 1)
          }}
        />
      </div>

      <div style={{ paddingTop: 56 }}>
        <PagedReader
          content={book.content}
          settings={settings}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onTotalPages={handleTotalPages}
          charOffsetToJump={charOffsetToJump}
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
        content={book.content}
        onNavigate={(offset) => setCharOffsetToJump(offset)}
      />

      <BookmarksPanel
        open={bookmarksOpen}
        onClose={() => setBookmarksOpen(false)}
        bookId={bookId}
        onNavigate={handlePageChange}
        onAddBookmark={handleAddBookmark}
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
