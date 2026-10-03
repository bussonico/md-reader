// Types kept for compatibility - primary storage is now Supabase
// Settings are stored in localStorage

export interface Settings {
  id: 'global'
  fontSize: number
  lineHeight: number
  fontFamily: string
  theme: 'Claro' | 'Sepia' | 'Oscuro' | 'Negro' | 'Naranja'
  margins: 'S' | 'M' | 'L'
  alignment: 'left' | 'justify'
  readingMode: 'paginado' | 'scroll'
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

// Supabase book type
export interface SupabaseBook {
  id: string
  owner_id: string
  title: string
  content_md: string
  is_public: boolean
  cover_gradient: Record<string, string>
  created_at: string
  updated_at: string
}

// Supabase progress type
export interface SupabaseProgress {
  id: string
  user_id: string
  book_id: string
  page_index: number
  total_pages: number
  ratio: number
  updated_at: string
}

// Supabase highlight type
export interface SupabaseHighlight {
  id: string
  user_id: string
  book_id: string
  selected_text: string
  note: string
  color: string
  page_index: number
  char_start: number
  char_end: number
  created_at: string
}
