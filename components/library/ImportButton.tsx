'use client'

import { useRef, useState } from 'react'
import { pdfToMarkdown } from '@/lib/pdf'

interface ImportButtonProps {
  onImport: (content: string, filename: string) => Promise<string>
}

export default function ImportButton({ onImport }: ImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)

  const handleFiles = async (files: FileList | null) => {
    if (!files) return
    setImporting(true)
    try {
      for (const file of Array.from(files)) {
        if (file.name.endsWith('.pdf')) {
          const content = await pdfToMarkdown(file)
          await onImport(content, file.name.replace(/\.pdf$/, ''))
        } else if (file.name.endsWith('.md') || file.name.endsWith('.txt')) {
          const content = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => resolve(e.target?.result as string)
            reader.onerror = reject
            reader.readAsText(file)
          })
          await onImport(content, file.name.replace(/\.(md|txt)$/, ''))
        }
      }
    } catch (e) {
      console.error('Import error:', e)
    } finally {
      setImporting(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".md,.txt,.pdf"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={importing}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-700 transition-colors active:scale-95 disabled:opacity-60"
      >
        {importing ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1v10M4 5l4-4 4 4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {importing ? 'Importando...' : 'Importar'}
      </button>
    </>
  )
}
