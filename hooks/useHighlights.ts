'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SupabaseHighlight } from '@/lib/db'

export function useHighlights(bookId: string | null, userId: string | null) {
  const [highlights, setHighlights] = useState<SupabaseHighlight[]>([])

  useEffect(() => {
    if (!bookId || !userId) return
    const supabase = createClient()
    supabase
      .from('highlights')
      .select('*')
      .eq('book_id', bookId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setHighlights(data ?? [])
      })
  }, [bookId, userId])

  const addHighlight = useCallback(
    async (highlight: Omit<SupabaseHighlight, 'id' | 'user_id' | 'book_id' | 'created_at'>) => {
      if (!bookId || !userId) return null
      const supabase = createClient()
      const { data, error } = await supabase
        .from('highlights')
        .insert({
          ...highlight,
          user_id: userId,
          book_id: bookId,
        })
        .select()
        .single()
      if (error) { console.error(error); return null }
      setHighlights((prev) => [...prev, data])
      return data
    },
    [bookId, userId]
  )

  const updateHighlight = useCallback(async (id: string, updates: Partial<SupabaseHighlight>) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('highlights')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (data) {
      setHighlights((prev) => prev.map((h) => h.id === id ? data : h))
    }
  }, [])

  const deleteHighlight = useCallback(async (id: string) => {
    const supabase = createClient()
    await supabase.from('highlights').delete().eq('id', id)
    setHighlights((prev) => prev.filter((h) => h.id !== id))
  }, [])

  return { highlights, addHighlight, updateHighlight, deleteHighlight }
}
