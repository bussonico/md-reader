'use client'

import { useState, useEffect, useRef } from 'react'

interface HighlightMenuProps {
  x: number
  y: number
  onSelectColor: (color: string) => void
  onAddNote: (note: string) => void
  onClose: () => void
}

const COLORS = [
  { key: 'yellow', label: 'Amarillo', bg: '#FFE600', dot: '#FFE600' },
  { key: 'orange', label: 'Naranja', bg: '#FF8C00', dot: '#FF8C00' },
  { key: 'green', label: 'Verde', bg: '#32CD32', dot: '#32CD32' },
  { key: 'pink', label: 'Rosa', bg: '#FF69B4', dot: '#FF69B4' },
]

export default function HighlightMenu({ x, y, onSelectColor, onAddNote, onClose }: HighlightMenuProps) {
  const [showNote, setShowNote] = useState(false)
  const [noteText, setNoteText] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  // Adjust position to stay on screen
  const menuX = Math.max(8, Math.min(x - 100, window.innerWidth - 216))
  const menuY = y - 56

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  if (showNote) {
    return (
      <div
        ref={menuRef}
        style={{
          position: 'fixed',
          left: Math.max(16, Math.min(x - 120, window.innerWidth - 256)),
          top: Math.max(16, menuY - 60),
          zIndex: 100,
          backgroundColor: '#1a1a1a',
          borderRadius: 12,
          padding: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          width: 240,
          border: '1px solid #333',
        }}
      >
        <textarea
          autoFocus
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Escribe una nota..."
          style={{
            width: '100%',
            backgroundColor: '#2a2a2a',
            border: '1px solid #444',
            borderRadius: 8,
            color: '#F5F0EB',
            fontSize: 13,
            padding: '8px 10px',
            resize: 'none',
            outline: 'none',
            boxSizing: 'border-box',
            minHeight: 64,
          }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            onClick={() => { onAddNote(noteText); setNoteText('') }}
            style={{
              flex: 1,
              padding: '7px',
              backgroundColor: '#F5F0EB',
              color: '#0A0A0A',
              borderRadius: 8,
              border: 'none',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Guardar
          </button>
          <button
            onClick={() => { setShowNote(false); setNoteText('') }}
            style={{
              padding: '7px 12px',
              backgroundColor: '#2a2a2a',
              color: '#9A9A9A',
              borderRadius: 8,
              border: '1px solid #444',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: menuX,
        top: Math.max(16, menuY),
        zIndex: 100,
        backgroundColor: '#1a1a1a',
        borderRadius: 24,
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        border: '1px solid #333',
      }}
    >
      {COLORS.map((c) => (
        <button
          key={c.key}
          onClick={() => onSelectColor(c.key)}
          title={c.label}
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: c.dot,
            border: '2px solid rgba(255,255,255,0.3)',
            cursor: 'pointer',
            transition: 'transform 0.1s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.2)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
        />
      ))}
      <div style={{ width: 1, height: 20, backgroundColor: '#444' }} />
      <button
        onClick={() => setShowNote(true)}
        style={{
          padding: '4px 10px',
          backgroundColor: 'transparent',
          color: '#F5F0EB',
          border: '1px solid #555',
          borderRadius: 12,
          fontSize: 11,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        + Nota
      </button>
    </div>
  )
}
