'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { extractTitle } from '@/lib/markdown'
import { generateCoverGradient } from '@/lib/colors'
import type { SupabaseBook } from '@/lib/db'

export function useBooks(userId: string | null) {
  const [books, setBooks] = useState<SupabaseBook[]>([])
  const [loading, setLoading] = useState(true)

  const loadBooks = useCallback(async () => {
    if (!userId) {
      setBooks([])
      setLoading(false)
      return
    }
    const supabase = createClient()
    const { data } = await supabase
      .from('books')
      .select('*')
      .or(`owner_id.eq.${userId},is_public.eq.true`)
      .order('created_at', { ascending: false })
    setBooks(data ?? [])
    setLoading(false)
  }, [userId])

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  const importBook = useCallback(async (content: string, filename?: string): Promise<string> => {
    if (!userId) throw new Error('Not authenticated')
    const supabase = createClient()
    const title = extractTitle(content) || filename || 'Sin título'
    const { gradient } = generateCoverGradient(title)
    const { data, error } = await supabase
      .from('books')
      .insert({
        owner_id: userId,
        title,
        content_md: content,
        is_public: false,
        cover_gradient: { gradient },
      })
      .select()
      .single()
    if (error) throw error
    setBooks((prev) => [data, ...prev])
    return data.id
  }, [userId])

  const deleteBook = useCallback(async (id: string) => {
    const supabase = createClient()
    await supabase.from('books').delete().eq('id', id)
    setBooks((prev) => prev.filter((b) => b.id !== id))
  }, [])

  const togglePublic = useCallback(async (id: string, isPublic: boolean) => {
    const supabase = createClient()
    await supabase.from('books').update({ is_public: isPublic }).eq('id', id)
    setBooks((prev) => prev.map((b) => b.id === id ? { ...b, is_public: isPublic } : b))
  }, [])

  return { books, loading, importBook, deleteBook, togglePublic, reload: loadBooks }
}

export type { SupabaseBook as Book }
