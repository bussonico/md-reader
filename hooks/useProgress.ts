'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SupabaseProgress } from '@/lib/db'

export function useProgress(bookId: string | null, userId: string | null) {
  const [progress, setProgress] = useState<SupabaseProgress | null>(null)

  useEffect(() => {
    if (!bookId || !userId) return
    const supabase = createClient()
    supabase
      .from('reading_progress')
      .select('*')
      .eq('book_id', bookId)
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setProgress(data)
      })
  }, [bookId, userId])

  const saveProgress = useCallback(
    async (pageIndex: number, totalPages: number) => {
      if (!bookId || !userId) return
      const ratio = totalPages > 1 ? pageIndex / (totalPages - 1) : 0
      const supabase = createClient()
      const update = {
        user_id: userId,
        book_id: bookId,
        page_index: pageIndex,
        total_pages: totalPages,
        ratio,
        updated_at: new Date().toISOString(),
      }
      const { data } = await supabase
        .from('reading_progress')
        .upsert(update, { onConflict: 'user_id,book_id' })
        .select()
        .single()
      if (data) setProgress(data)
    },
    [bookId, userId]
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
