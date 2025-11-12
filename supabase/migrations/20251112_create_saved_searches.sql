-- Create saved_searches table
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  search_config JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique name per user
  CONSTRAINT unique_user_search_name UNIQUE (user_id, name)
);

-- Create index on user_id for efficient querying
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON public.saved_searches(user_id);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_saved_searches_created_at ON public.saved_searches(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own saved searches
CREATE POLICY "Users can view own saved searches"
  ON public.saved_searches
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own saved searches (with limit enforced by function)
CREATE POLICY "Users can insert own saved searches"
  ON public.saved_searches
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own saved searches
CREATE POLICY "Users can update own saved searches"
  ON public.saved_searches
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own saved searches
CREATE POLICY "Users can delete own saved searches"
  ON public.saved_searches
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to enforce 5 saved searches limit
CREATE OR REPLACE FUNCTION public.check_saved_searches_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.saved_searches WHERE user_id = NEW.user_id) >= 5 THEN
    RAISE EXCEPTION 'User cannot have more than 5 saved searches';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce limit before insert
CREATE TRIGGER enforce_saved_searches_limit
  BEFORE INSERT ON public.saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION public.check_saved_searches_limit();

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_saved_searches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on updates
CREATE TRIGGER set_saved_searches_updated_at
  BEFORE UPDATE ON public.saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_saved_searches_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_searches TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Add comment explaining the search_config structure
COMMENT ON COLUMN public.saved_searches.search_config IS 'JSON object containing search parameters: { query?: string, country?: string, major?: string, minAcceptanceRate?: number, maxAcceptanceRate?: number, filters?: object }';
