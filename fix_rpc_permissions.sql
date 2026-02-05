-- Comprehensive fix for download count permissions
-- Run this in your Supabase SQL Editor

-- Recreate the function with proper permissions
DROP FUNCTION IF EXISTS public.increment_download_count(UUID);

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

-- Grant execute permission to all roles
GRANT EXECUTE ON FUNCTION public.increment_download_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_download_count(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_download_count(UUID) TO public;

-- Also grant usage on the schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;