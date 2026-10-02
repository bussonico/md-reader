'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db, Book } from '@/lib/db'
import { extractTitle } from '@/lib/markdown'
import { generateCoverColor } from '@/lib/colors'

export function useBooks() {
  const books = useLiveQuery(() => db.books.orderBy('importedAt').reverse().toArray(), [])

  const importBook = async (content: string, filename?: string): Promise<number> => {
    const title = extractTitle(content) || filename || 'Sin título'
    const coverColor = generateCoverColor(title)
    const id = await db.books.add({
      title,
      content,
      importedAt: new Date(),
      coverColor,
    })
    return id as number
  }

  const deleteBook = async (id: number) => {
    await db.books.delete(id)
    await db.progress.delete(id)
    await db.bookmarks.where('bookId').equals(id).delete()
  }

  return { books: books ?? [], importBook, deleteBook }
}

export type { Book }
