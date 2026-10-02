'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeSanitize from 'rehype-sanitize'
import { Settings } from '@/lib/db'

interface PagedReaderProps {
  content: string
  settings: Settings
  currentPage: number
  onPageChange: (page: number) => void
  onTotalPages: (total: number) => void
  onToggleUI: () => void
  charOffsetToJump?: number | null
}

const THEME_STYLES: Record<Settings['theme'], { bg: string; text: string; accent: string }> = {
  Claro: { bg: '#FFFFFF', text: '#1a1a1a', accent: '#1a1a1a' },
  Sepia: { bg: '#F4ECD8', text: '#3d2b1f', accent: '#8b4513' },
  Oscuro: { bg: '#1c1c1e', text: '#e5e5e5', accent: '#e5e5e5' },
  Negro: { bg: '#000000', text: '#e5e5e5', accent: '#e5e5e5' },
}

const MARGIN_VALUES: Record<Settings['margins'], { x: number; y: number }> = {
  S: { x: 16, y: 16 },
  M: { x: 28, y: 20 },
  L: { x: 48, y: 32 },
}

export default function PagedReader({
  content,
  settings,
  currentPage,
  onPageChange,
  onTotalPages,
  onToggleUI,
  charOffsetToJump,
}: PagedReaderProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [readerHeight, setReaderHeight] = useState(0)
  const [pageWidth, setPageWidth] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Touch handling for swipes
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const didSwipe = useRef(false)

  const theme = THEME_STYLES[settings.theme]
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

  // Tap navigation (click)
  const handleTap = (e: React.MouseEvent) => {
    if (didSwipe.current) {
      didSwipe.current = false
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

  const scrollMode = settings.readingMode === 'scroll'

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
      </div>
    )
  }

  // Paged mode
  // Outer: clips to full viewport width, overflow hidden
  // Inner: narrower (pageWidth - 2*marginX), left-offset by marginX → gives equal margins
  // Content: columns of colWidth, translates horizontally per page
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
