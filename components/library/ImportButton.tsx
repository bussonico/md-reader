'use client'

import { useRef } from 'react'

interface ImportButtonProps {
  onImport: (content: string, filename: string) => void
}

export default function ImportButton({ onImport }: ImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach((file) => {
      if (!file.name.endsWith('.md') && !file.name.endsWith('.txt')) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        onImport(content, file.name.replace(/\.(md|txt)$/, ''))
      }
      reader.readAsText(file)
    })
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".md,.txt"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-700 transition-colors active:scale-95"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 1v10M4 5l4-4 4 4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Importar .md
      </button>
    </>
  )
}
