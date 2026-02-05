-- Fix download count tracking
-- Run this in your Supabase SQL Editor

-- Create or replace the increment_download_count function
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

-- Reset all download counts to 0 (optional - only if you want to start fresh)
-- UPDATE public.worksheets SET download_count = 0;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.increment_download_count(UUID) TO authenticated;