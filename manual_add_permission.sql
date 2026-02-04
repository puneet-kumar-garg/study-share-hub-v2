-- Just add a row manually to grant permission
-- Run this in Supabase SQL editor

INSERT INTO public.user_permissions (email, can_upload, granted_by)
VALUES ('test@example.com', true, 'admin')
ON CONFLICT (email) DO UPDATE SET can_upload = true;