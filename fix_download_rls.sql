-- Fix download count tracking with a secure function
-- Run this in your Supabase SQL Editor

-- Create a secure function to increment download count
CREATE OR REPLACE FUNCTION public.increment_download_count(worksheet_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.worksheets
  SET download_count = COALESCE(download_count, 0) + 1
  WHERE id = worksheet_uuid;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.increment_download_count(UUID) TO authenticated;

-- Ensure the original update policy exists for content updates
DROP POLICY IF EXISTS "Users can update own worksheets" ON public.worksheets;
CREATE POLICY "Users can update own worksheets" ON public.worksheets
  FOR UPDATE TO authenticated 
  USING (auth.uid() = uploader_id)
  WITH CHECK (auth.uid() = uploader_id);