import Dexie, { type Table } from 'dexie'

export interface Book {
  id?: number
  title: string
  content: string
  importedAt: Date
  coverColor: string
}

export interface Progress {
  bookId: number
  pageIndex: number
  totalPages: number
  ratio: number
  updatedAt: Date
}

export interface Settings {
  id: 'global'
  fontSize: number
  lineHeight: number
  fontFamily: string
  theme: 'Claro' | 'Sepia' | 'Oscuro' | 'Negro'
  margins: 'S' | 'M' | 'L'
  alignment: 'left' | 'justify'
  readingMode: 'paginado' | 'scroll'
}

export interface Bookmark {
  id?: number
  bookId: number
  pageIndex: number
  text: string
  note: string
  createdAt: Date
}

export const DEFAULT_SETTINGS: Settings = {
  id: 'global',
  fontSize: 18,
  lineHeight: 1.6,
  fontFamily: 'Merriweather',
  theme: 'Claro',
  margins: 'M',
  alignment: 'left',
  readingMode: 'paginado',
}

class MdReaderDB extends Dexie {
  books!: Table<Book>
  progress!: Table<Progress>
  settings!: Table<Settings>
  bookmarks!: Table<Bookmark>

  constructor() {
    super('MdReaderDB')
    this.version(1).stores({
      books: '++id, title, importedAt',
      progress: 'bookId',
      settings: 'id',
      bookmarks: '++id, bookId, pageIndex',
    })
  }
}

export const db = new MdReaderDB()
