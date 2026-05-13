-- Article Votes table
CREATE TABLE public.article_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_type TEXT NOT NULL,
  article_id UUID NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('yes', 'no')),
  voter_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint to prevent duplicate votes
CREATE UNIQUE INDEX article_votes_unique_vote ON public.article_votes(article_type, article_id, voter_hash);

-- Index for counting votes
CREATE INDEX article_votes_article_idx ON public.article_votes(article_type, article_id, vote_type);

-- Article Comments table
CREATE TABLE public.article_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_type TEXT NOT NULL,
  article_id UUID NOT NULL,
  parent_id UUID REFERENCES public.article_comments(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for comments
CREATE INDEX article_comments_article_idx ON public.article_comments(article_type, article_id);
CREATE INDEX article_comments_parent_idx ON public.article_comments(parent_id);

-- Enable RLS
ALTER TABLE public.article_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_comments ENABLE ROW LEVEL SECURITY;

-- Votes policies: Anyone can insert (vote), anyone can read counts
CREATE POLICY "Anyone can vote" ON public.article_votes
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read votes" ON public.article_votes
  FOR SELECT TO anon, authenticated
  USING (true);

-- Comments policies: Anyone can insert (with name/email), approved comments are public
CREATE POLICY "Anyone can add comments" ON public.article_comments
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read approved comments" ON public.article_comments
  FOR SELECT TO anon, authenticated
  USING (is_approved = true);

-- Authenticated users (admins) can update/delete comments
CREATE POLICY "Admins can update comments" ON public.article_comments
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete comments" ON public.article_comments
  FOR DELETE TO authenticated
  USING (true);