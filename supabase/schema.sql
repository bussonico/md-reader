-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Books table
CREATE TABLE IF NOT EXISTS public.books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content_md TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  cover_gradient JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reading progress
CREATE TABLE IF NOT EXISTS public.reading_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  page_index INTEGER DEFAULT 0,
  total_pages INTEGER DEFAULT 1,
  ratio FLOAT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- Highlights (includes optional notes)
CREATE TABLE IF NOT EXISTS public.highlights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  selected_text TEXT NOT NULL,
  note TEXT DEFAULT '',
  color TEXT DEFAULT 'yellow',
  page_index INTEGER DEFAULT 0,
  char_start INTEGER DEFAULT 0,
  char_end INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;

-- Books policies
CREATE POLICY "Users can view their own books" ON public.books
  FOR SELECT USING (owner_id = auth.uid() OR is_public = true);
CREATE POLICY "Users can insert own books" ON public.books
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update own books" ON public.books
  FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Users can delete own books" ON public.books
  FOR DELETE USING (owner_id = auth.uid());

-- Reading progress policies
CREATE POLICY "Users can view own progress" ON public.reading_progress
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own progress" ON public.reading_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own progress" ON public.reading_progress
  FOR UPDATE USING (user_id = auth.uid());

-- Highlights policies
CREATE POLICY "Users can view own highlights" ON public.highlights
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own highlights" ON public.highlights
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own highlights" ON public.highlights
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own highlights" ON public.highlights
  FOR DELETE USING (user_id = auth.uid());
