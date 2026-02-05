-- Fix RLS policies to allow download count updates by any authenticated user
-- Run this in your Supabase SQL Editor

-- Drop existing update policy for worksheets
DROP POLICY IF EXISTS "Users can update own worksheets" ON public.worksheets;

-- Create new policies that separate download count updates from other updates
CREATE POLICY "Users can update own worksheets content" ON public.worksheets
  FOR UPDATE TO authenticated 
  USING (auth.uid() = uploader_id)
  WITH CHECK (auth.uid() = uploader_id AND download_count = OLD.download_count);

-- Allow any authenticated user to increment download count
CREATE POLICY "Anyone can increment download count" ON public.worksheets
  FOR UPDATE TO authenticated 
  USING (true)
  WITH CHECK (
    -- Only allow updating download_count, everything else must stay the same
    title = OLD.title AND
    description = OLD.description AND
    subject = OLD.subject AND
    status = OLD.status AND
    file_path = OLD.file_path AND
    file_name = OLD.file_name AND
    file_size = OLD.file_size AND
    uploader_id = OLD.uploader_id AND
    created_at = OLD.created_at AND
    download_count >= OLD.download_count
  );