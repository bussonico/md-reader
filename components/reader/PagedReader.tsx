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
  L: { x: 44, y: 28 },
}

export default function PagedReader({
  content,
  settings,
  currentPage,
  onPageChange,
  onTotalPages,
  charOffsetToJump,
}: PagedReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [readerHeight, setReaderHeight] = useState(0)
  const [pageWidth, setPageWidth] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  const theme = THEME_STYLES[settings.theme]
  const margin = MARGIN_VALUES[settings.margins]

  // Calculate dimensions
  const updateDimensions = useCallback(() => {
    const header = 56 // top bar
    const footer = 56 // bottom bar
    const h = window.innerHeight - header - footer
    const w = window.innerWidth
    setReaderHeight(h)
    setPageWidth(w)
  }, [])

  useEffect(() => {
    updateDimensions()
    const ro = new ResizeObserver(updateDimensions)
    ro.observe(document.documentElement)
    return () => ro.disconnect()
  }, [updateDimensions])

  // Calculate total pages after content renders
  useEffect(() => {
    if (!contentRef.current || pageWidth === 0 || readerHeight === 0) return
    const ro = new ResizeObserver(() => {
      if (!contentRef.current || pageWidth === 0) return
      const scrollWidth = contentRef.current.scrollWidth
      const total = Math.max(1, Math.round(scrollWidth / pageWidth))
      setTotalPages(total)
      onTotalPages(total)
    })
    ro.observe(contentRef.current)
    return () => ro.disconnect()
  }, [pageWidth, readerHeight, onTotalPages, content, settings])

  // Jump to char offset (for search/TOC)
  useEffect(() => {
    if (charOffsetToJump == null || !contentRef.current || pageWidth === 0) return
    // Find which page the char offset falls in by scanning text nodes
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
      const page = Math.floor(relativeLeft / pageWidth)
      onPageChange(Math.max(0, Math.min(page, totalPages - 1)))
    }
  }, [charOffsetToJump, pageWidth, totalPages, onPageChange])

  // Touch navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    touchStartX.current = null
    touchStartY.current = null
    if (Math.abs(dx) < Math.abs(dy)) return // vertical scroll
    if (Math.abs(dx) < 30) return // too small
    if (dx < 0 && currentPage < totalPages - 1) {
      onPageChange(currentPage + 1)
    } else if (dx > 0 && currentPage > 0) {
      onPageChange(currentPage - 1)
    }
  }

  // Tap navigation
  const handleTap = (e: React.MouseEvent) => {
    const x = e.clientX
    const w = window.innerWidth
    const zone = w * 0.35
    if (x < zone) {
      if (currentPage > 0) onPageChange(currentPage - 1)
    } else if (x > w - zone) {
      if (currentPage < totalPages - 1) onPageChange(currentPage + 1)
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

  return (
    <div
      ref={containerRef}
      style={{
        width: '100dvw',
        height: `${readerHeight}px`,
        overflow: 'hidden',
        backgroundColor: theme.bg,
        position: 'relative',
        userSelect: 'none',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleTap}
    >
      <div
        ref={contentRef}
        style={{
          height: `${readerHeight}px`,
          columns: `${pageWidth}px`,
          columnGap: '0px',
          columnFill: 'auto',
          width: 'max-content',
          transform: `translateX(-${currentPage * pageWidth}px)`,
          transition: 'transform 0.2s ease',
          paddingLeft: margin.x,
          paddingRight: margin.x,
          paddingTop: margin.y,
          paddingBottom: margin.y,
          boxSizing: 'border-box',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          color: theme.text,
          fontFamily: settings.fontFamily,
          fontSize: settings.fontSize,
          lineHeight: settings.lineHeight,
          textAlign: settings.alignment,
        }}
      >
        <MarkdownContent content={content} theme={theme} />
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
        .md-content h1 { font-size: 1.6em; font-weight: 800; margin: 1em 0 0.5em; color: ${theme.text}; }
        .md-content h2 { font-size: 1.3em; font-weight: 700; margin: 1em 0 0.4em; color: ${theme.text}; }
        .md-content h3 { font-size: 1.1em; font-weight: 600; margin: 0.8em 0 0.3em; color: ${theme.text}; }
        .md-content p { margin: 0 0 0.8em; }
        .md-content ul, .md-content ol { margin: 0 0 0.8em 1.5em; }
        .md-content li { margin-bottom: 0.2em; }
        .md-content blockquote { border-left: 3px solid ${theme.accent}; padding-left: 1em; margin: 0.8em 0; opacity: 0.8; font-style: italic; }
        .md-content code { font-family: monospace; font-size: 0.85em; background: rgba(128,128,128,0.15); padding: 0.1em 0.3em; border-radius: 3px; }
        .md-content pre { background: rgba(128,128,128,0.15); padding: 0.8em; border-radius: 6px; overflow-x: auto; margin: 0.8em 0; break-inside: avoid; }
        .md-content pre code { background: none; padding: 0; }
        .md-content table { border-collapse: collapse; width: 100%; margin: 0.8em 0; break-inside: avoid; font-size: 0.9em; }
        .md-content th, .md-content td { border: 1px solid rgba(128,128,128,0.3); padding: 0.4em 0.6em; text-align: left; }
        .md-content th { background: rgba(128,128,128,0.1); font-weight: 600; }
        .md-content a { color: ${theme.accent}; text-decoration: underline; }
        .md-content hr { border: none; border-top: 1px solid rgba(128,128,128,0.3); margin: 1em 0; }
        .md-content strong { font-weight: 700; }
        .md-content em { font-style: italic; }
        .md-content img { max-width: 100%; border-radius: 4px; break-inside: avoid; }
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
