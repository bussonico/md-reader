'use client'

import { useState, useEffect, useCallback } from 'react'
import { db, Progress } from '@/lib/db'

export function useProgress(bookId: number) {
  const [progress, setProgress] = useState<Progress | null>(null)

  useEffect(() => {
    if (!bookId) return
    db.progress.get(bookId).then((p) => {
      if (p) setProgress(p)
    })
  }, [bookId])

  const saveProgress = useCallback(
    async (pageIndex: number, totalPages: number) => {
      const ratio = totalPages > 1 ? pageIndex / (totalPages - 1) : 0
      const p: Progress = {
        bookId,
        pageIndex,
        totalPages,
        ratio,
        updatedAt: new Date(),
      }
      setProgress(p)
      await db.progress.put(p)
    },
    [bookId]
  )

  const restorePage = useCallback(
    (totalPages: number): number => {
      if (!progress || totalPages <= 0) return 0
      return Math.round(progress.ratio * (totalPages - 1))
    },
    [progress]
  )

  return { progress, saveProgress, restorePage }
}
