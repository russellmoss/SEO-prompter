-- Create excel_files table
CREATE TABLE IF NOT EXISTS public.excel_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  blob_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT DEFAULT 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_excel_files_uploaded_at ON public.excel_files(uploaded_at DESC);
CREATE INDEX idx_excel_files_last_used_at ON public.excel_files(last_used_at DESC);

-- Enable RLS
ALTER TABLE public.excel_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust based on your auth setup)
CREATE POLICY "Anyone can read excel files" ON public.excel_files
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert excel files" ON public.excel_files
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update excel files" ON public.excel_files
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete excel files" ON public.excel_files
  FOR DELETE USING (true); 