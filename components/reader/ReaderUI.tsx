'use client'

import Link from 'next/link'
import { Settings } from '@/lib/db'

interface ReaderUIProps {
  visible: boolean
  title: string
  currentPage: number
  totalPages: number
  theme: Settings['theme']
  onToggleTOC: () => void
  onToggleSearch: () => void
  onToggleBookmarks: () => void
  onToggleSettings: () => void
}

const THEME_STYLES: Record<Settings['theme'], { bar: string; text: string; border: string }> = {
  Claro: { bar: '#FFFFFF', text: '#1a1a1a', border: 'rgba(0,0,0,0.1)' },
  Sepia: { bar: '#F4ECD8', text: '#3d2b1f', border: 'rgba(0,0,0,0.1)' },
  Oscuro: { bar: '#1c1c1e', text: '#e5e5e5', border: 'rgba(255,255,255,0.1)' },
  Negro: { bar: '#000000', text: '#e5e5e5', border: 'rgba(255,255,255,0.08)' },
}

export default function ReaderUI({
  visible,
  title,
  currentPage,
  totalPages,
  theme,
  onToggleTOC,
  onToggleSearch,
  onToggleBookmarks,
  onToggleSettings,
}: ReaderUIProps) {
  const s = THEME_STYLES[theme]
  const progress = totalPages > 1 ? ((currentPage) / (totalPages - 1)) * 100 : 0

  return (
    <>
      {/* Top bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 transition-transform duration-300 ${
          visible ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{
          height: 56,
          backgroundColor: s.bar,
          borderBottom: `1px solid ${s.border}`,
          color: s.text,
        }}
      >
        <Link
          href="/"
          className="flex items-center justify-center w-9 h-9 rounded-xl hover:opacity-70 transition-opacity"
          style={{ color: s.text }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <p className="flex-1 text-sm font-medium truncate" style={{ color: s.text }}>
          {title}
        </p>
        <button onClick={onToggleSearch} className="w-9 h-9 flex items-center justify-center rounded-xl hover:opacity-70" style={{ color: s.text }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.7" />
            <path d="M14 14l-2.5-2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>
        <button onClick={onToggleTOC} className="w-9 h-9 flex items-center justify-center rounded-xl hover:opacity-70" style={{ color: s.text }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 5h10M4 9h10M4 13h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Bottom bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-30 flex items-center gap-3 px-4 transition-transform duration-300 ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          height: 56,
          backgroundColor: s.bar,
          borderTop: `1px solid ${s.border}`,
          color: s.text,
        }}
      >
        {/* Progress */}
        <div className="flex-1 flex items-center gap-3">
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: `${s.border}` }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, backgroundColor: s.text, opacity: 0.5 }}
            />
          </div>
          <span className="text-xs opacity-60 whitespace-nowrap">
            {currentPage + 1} / {totalPages}
          </span>
        </div>
        <button onClick={onToggleBookmarks} className="w-9 h-9 flex items-center justify-center rounded-xl hover:opacity-70" style={{ color: s.text }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M5 3h8a1 1 0 011 1v11l-4.5-3L5 15V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          </svg>
        </button>
        <button onClick={onToggleSettings} className="w-9 h-9 flex items-center justify-center rounded-xl hover:opacity-70" style={{ color: s.text }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.7" />
            <path d="M9 2v2M9 14v2M2 9h2M14 9h2M3.5 3.5l1.4 1.4M13.1 13.1l1.4 1.4M3.5 14.5l1.4-1.4M13.1 4.9l1.4-1.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </>
  )
}
