'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeSanitize from 'rehype-sanitize'
import { Settings } from '@/lib/db'
import HighlightMenu from './HighlightMenu'
import type { SupabaseHighlight } from '@/lib/db'

interface PagedReaderProps {
  content: string
  settings: Settings
  currentPage: number
  onPageChange: (page: number) => void
  onTotalPages: (total: number) => void
  onToggleUI: () => void
  charOffsetToJump?: number | null
  highlights?: SupabaseHighlight[]
  onAddHighlight?: (text: string, color: string, note: string, pageIndex: number, charStart: number, charEnd: number) => void
}

const THEME_STYLES: Record<Settings['theme'], { bg: string; text: string; accent: string }> = {
  Claro: { bg: '#FFFFFF', text: '#1a1a1a', accent: '#1a1a1a' },
  Sepia: { bg: '#F4ECD8', text: '#3d2b1f', accent: '#8b4513' },
  Oscuro: { bg: '#1c1c1e', text: '#e5e5e5', accent: '#e5e5e5' },
  Negro: { bg: '#000000', text: '#e5e5e5', accent: '#e5e5e5' },
  Naranja: { bg: '#1A0F00', text: '#FFD9A0', accent: '#FFA040' },
}

const MARGIN_VALUES: Record<Settings['margins'], { x: number; y: number }> = {
  S: { x: 16, y: 16 },
  M: { x: 28, y: 20 },
  L: { x: 48, y: 32 },
}

const HIGHLIGHT_COLORS: Record<string, string> = {
  yellow: 'rgba(255, 230, 0, 0.35)',
  orange: 'rgba(255, 140, 0, 0.35)',
  green: 'rgba(50, 205, 50, 0.30)',
  pink: 'rgba(255, 105, 180, 0.30)',
}

interface HighlightMenuState {
  visible: boolean
  x: number
  y: number
  selectedText: string
  charStart: number
  charEnd: number
}

export default function PagedReader({
  content,
  settings,
  currentPage,
  onPageChange,
  onTotalPages,
  onToggleUI,
  charOffsetToJump,
  highlights = [],
  onAddHighlight,
}: PagedReaderProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [readerHeight, setReaderHeight] = useState(0)
  const [pageWidth, setPageWidth] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [highlightMenu, setHighlightMenu] = useState<HighlightMenuState>({
    visible: false, x: 0, y: 0, selectedText: '', charStart: 0, charEnd: 0,
  })

  // Touch handling for swipes
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const didSwipe = useRef(false)

  // Long-press handling
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressStartX = useRef(0)
  const longPressStartY = useRef(0)
  const longPressTriggered = useRef(false)

  const theme = THEME_STYLES[settings.theme] ?? THEME_STYLES.Claro
  const margin = MARGIN_VALUES[settings.margins]

  // Column width = viewport - margins on each side
  const colWidth = pageWidth > 0 ? pageWidth - 2 * margin.x : 0

  // Calculate dimensions
  const updateDimensions = useCallback(() => {
    const header = 56
    const footer = 56
    const h = window.innerHeight - header - footer
    const w = window.innerWidth
    setReaderHeight(h)
    setPageWidth(w)
  }, [])

  useEffect(() => {
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [updateDimensions])

  // Recalculate totalPages when content or dimensions change
  useEffect(() => {
    if (!contentRef.current || colWidth <= 0 || readerHeight <= 0) return
    const ro = new ResizeObserver(() => {
      if (!contentRef.current || colWidth <= 0) return
      const total = Math.max(1, Math.ceil(contentRef.current.scrollWidth / colWidth))
      setTotalPages(total)
      onTotalPages(total)
    })
    ro.observe(contentRef.current)
    return () => ro.disconnect()
  }, [colWidth, readerHeight, onTotalPages, content, settings])

  // Jump to char offset (for search/TOC)
  useEffect(() => {
    if (charOffsetToJump == null || !contentRef.current || colWidth <= 0) return
    const walker = document.createTreeWalker(contentRef.current, NodeFilter.SHOW_TEXT)
    let charCount = 0
    let targetNode: Text | null = null
    let nodeOffset = 0
    while (walker.nextNode()) {
      const node = walker.currentNode as Text
      const len = node.textContent?.length ?? 0
      if (charCount + len >= charOffsetToJump) {
        targetNode = node
        nodeOffset = charOffsetToJump - charCount
        break
      }
      charCount += len
    }
    if (targetNode) {
      const range = document.createRange()
      range.setStart(targetNode, Math.min(nodeOffset, targetNode.length))
      range.collapse(true)
      const rect = range.getBoundingClientRect()
      const containerRect = contentRef.current.getBoundingClientRect()
      const relativeLeft = rect.left - containerRect.left
      const page = Math.floor(relativeLeft / colWidth)
      onPageChange(Math.max(0, Math.min(page, totalPages - 1)))
    }
  }, [charOffsetToJump, colWidth, totalPages, onPageChange])

  // Touch navigation (swipe)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    didSwipe.current = false
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    touchStartX.current = null
    touchStartY.current = null

    if (Math.abs(dx) < Math.abs(dy) * 1.2) return // more vertical than horizontal
    if (Math.abs(dx) < 40) return // too small, treat as tap

    didSwipe.current = true
    if (dx < 0 && currentPage < totalPages - 1) {
      onPageChange(currentPage + 1) // swipe left = next
    } else if (dx > 0 && currentPage > 0) {
      onPageChange(currentPage - 1) // swipe right = prev
    }
  }

  // Long press for highlights
  const handlePointerDown = (e: React.PointerEvent) => {
    longPressStartX.current = e.clientX
    longPressStartY.current = e.clientY
    longPressTriggered.current = false

    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true
      // Get selection if any
      const sel = window.getSelection()
      if (sel && sel.toString().trim().length > 0) {
        const range = sel.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        const fullText = contentRef.current?.textContent ?? ''

        // Calculate char offsets
        let charStart = 0
        let charEnd = 0
        if (contentRef.current) {
          const walker = document.createTreeWalker(contentRef.current, NodeFilter.SHOW_TEXT)
          let count = 0
          let foundStart = false
          while (walker.nextNode()) {
            const node = walker.currentNode as Text
            if (node === range.startContainer) {
              charStart = count + range.startOffset
              foundStart = true
            }
            if (node === range.endContainer) {
              charEnd = count + range.endOffset
              break
            }
            count += node.length
            if (!foundStart) charStart = count
          }
        }

        setHighlightMenu({
          visible: true,
          x: rect.left + rect.width / 2,
          y: rect.top - 8,
          selectedText: sel.toString().trim(),
          charStart,
          charEnd,
        })
        void fullText
      }
    }, 500)
  }

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const dx = Math.abs(e.clientX - longPressStartX.current)
    const dy = Math.abs(e.clientY - longPressStartY.current)
    if (dx > 10 || dy > 10) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
    }
  }

  // Tap navigation (click)
  const handleTap = (e: React.MouseEvent) => {
    if (didSwipe.current) {
      didSwipe.current = false
      return
    }
    if (longPressTriggered.current) {
      longPressTriggered.current = false
      return
    }
    // Don't navigate if highlight menu is open
    if (highlightMenu.visible) {
      setHighlightMenu((m) => ({ ...m, visible: false }))
      return
    }
    const x = e.clientX
    const w = window.innerWidth
    if (x < w * 0.35) {
      if (currentPage > 0) onPageChange(currentPage - 1)
    } else if (x > w * 0.65) {
      if (currentPage < totalPages - 1) onPageChange(currentPage + 1)
    } else {
      onToggleUI()
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (currentPage < totalPages - 1) onPageChange(currentPage + 1)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (currentPage > 0) onPageChange(currentPage - 1)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentPage, totalPages, onPageChange])

  const handleHighlightSelect = (color: string) => {
    if (onAddHighlight && highlightMenu.selectedText) {
      onAddHighlight(
        highlightMenu.selectedText,
        color,
        '',
        currentPage,
        highlightMenu.charStart,
        highlightMenu.charEnd
      )
    }
    window.getSelection()?.removeAllRanges()
    setHighlightMenu((m) => ({ ...m, visible: false }))
  }

  const handleHighlightNote = (note: string) => {
    if (onAddHighlight && highlightMenu.selectedText) {
      onAddHighlight(
        highlightMenu.selectedText,
        'yellow',
        note,
        currentPage,
        highlightMenu.charStart,
        highlightMenu.charEnd
      )
    }
    window.getSelection()?.removeAllRanges()
    setHighlightMenu((m) => ({ ...m, visible: false }))
  }

  const scrollMode = settings.readingMode === 'scroll'

  // Build highlight CSS for current page
  const currentPageHighlights = highlights.filter((h) => h.page_index === currentPage)
  const highlightStyle = currentPageHighlights.map((h) => {
    const color = HIGHLIGHT_COLORS[h.color] ?? HIGHLIGHT_COLORS.yellow
    return `::selection { background: ${color}; }`
  }).join('\n')
  void highlightStyle

  if (scrollMode) {
    return (
      <div
        className="overflow-y-auto"
        style={{
          height: `${readerHeight}px`,
          backgroundColor: theme.bg,
          color: theme.text,
          paddingLeft: margin.x,
          paddingRight: margin.x,
          paddingTop: margin.y,
          paddingBottom: margin.y,
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleTap}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
      >
        <div
          style={{
            fontFamily: settings.fontFamily,
            fontSize: settings.fontSize,
            lineHeight: settings.lineHeight,
            textAlign: settings.alignment,
            maxWidth: 720,
            margin: '0 auto',
          }}
        >
          <MarkdownContent content={content} theme={theme} />
        </div>
        {highlightMenu.visible && (
          <HighlightMenu
            x={highlightMenu.x}
            y={highlightMenu.y}
            onSelectColor={handleHighlightSelect}
            onAddNote={handleHighlightNote}
            onClose={() => setHighlightMenu((m) => ({ ...m, visible: false }))}
          />
        )}
      </div>
    )
  }

  // Paged mode
  return (
    <div
      style={{
        width: '100dvw',
        height: `${readerHeight}px`,
        overflow: 'hidden',
        backgroundColor: theme.bg,
        position: 'relative',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleTap}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      {/* Inner viewport with margins applied via offset + width */}
      <div
        style={{
          position: 'absolute',
          left: margin.x,
          top: margin.y,
          width: colWidth,
          height: readerHeight - 2 * margin.y,
          overflow: 'hidden',
        }}
      >
        {/* Scrolling content strip */}
        <div
          ref={contentRef}
          style={{
            height: '100%',
            columns: `${colWidth}px`,
            columnGap: '0px',
            columnFill: 'auto',
            width: 'max-content',
            transform: `translateX(-${currentPage * colWidth}px)`,
            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            color: theme.text,
            fontFamily: settings.fontFamily,
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
            textAlign: settings.alignment as 'left' | 'justify',
          }}
        >
          <MarkdownContent content={content} theme={theme} />
        </div>
      </div>

      {highlightMenu.visible && (
        <HighlightMenu
          x={highlightMenu.x}
          y={highlightMenu.y}
          onSelectColor={handleHighlightSelect}
          onAddNote={handleHighlightNote}
          onClose={() => setHighlightMenu((m) => ({ ...m, visible: false }))}
        />
      )}
    </div>
  )
}

function MarkdownContent({
  content,
  theme,
}: {
  content: string
  theme: { bg: string; text: string; accent: string }
}) {
  return (
    <div className="md-content">
      <style>{`
        .md-content h1 { font-size: 1.5em; font-weight: 800; margin: 0 0 0.6em; color: ${theme.text}; break-after: avoid; }
        .md-content h2 { font-size: 1.25em; font-weight: 700; margin: 1.2em 0 0.5em; color: ${theme.text}; break-after: avoid; }
        .md-content h3 { font-size: 1.05em; font-weight: 600; margin: 1em 0 0.3em; color: ${theme.text}; break-after: avoid; }
        .md-content p { margin: 0 0 0.75em; orphans: 3; widows: 3; }
        .md-content ul, .md-content ol { margin: 0 0 0.75em 1.4em; }
        .md-content li { margin-bottom: 0.25em; }
        .md-content blockquote { border-left: 3px solid ${theme.accent}; padding-left: 0.9em; margin: 0.8em 0; opacity: 0.8; font-style: italic; break-inside: avoid; }
        .md-content code { font-family: 'Courier New', monospace; font-size: 0.82em; background: rgba(128,128,128,0.15); padding: 0.1em 0.3em; border-radius: 3px; }
        .md-content pre { background: rgba(128,128,128,0.15); padding: 0.75em; border-radius: 6px; overflow-x: auto; margin: 0.75em 0; break-inside: avoid; }
        .md-content pre code { background: none; padding: 0; }
        .md-content table { border-collapse: collapse; width: 100%; margin: 0.75em 0; break-inside: avoid; font-size: 0.88em; }
        .md-content th, .md-content td { border: 1px solid rgba(128,128,128,0.3); padding: 0.35em 0.55em; text-align: left; }
        .md-content th { background: rgba(128,128,128,0.12); font-weight: 600; }
        .md-content a { color: ${theme.accent}; text-decoration: underline; opacity: 0.9; }
        .md-content hr { border: none; border-top: 1px solid rgba(128,128,128,0.3); margin: 1em 0; }
        .md-content strong { font-weight: 700; }
        .md-content em { font-style: italic; }
        .md-content img { max-width: 100%; height: auto; border-radius: 4px; break-inside: avoid; display: block; margin: 0.5em 0; }
        .md-content mark { background: rgba(255, 230, 0, 0.4); border-radius: 2px; padding: 0 1px; }
      `}</style>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeSanitize]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
