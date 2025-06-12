-- Create the content_calendar_templates table
CREATE TABLE IF NOT EXISTS content_calendar_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  fields JSONB NOT NULL,
  output_fields JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies
ALTER TABLE content_calendar_templates ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON content_calendar_templates
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy to allow read-only access for anonymous users
CREATE POLICY "Enable read-only access for anonymous users" ON content_calendar_templates
  FOR SELECT
  TO anon
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_content_calendar_templates_created_at 
  ON content_calendar_templates(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_calendar_templates_name 
  ON content_calendar_templates(name);

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_content_calendar_templates_updated_at
    BEFORE UPDATE ON content_calendar_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 