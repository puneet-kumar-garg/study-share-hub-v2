-- Fix user_permissions table schema
-- Add user_id column and change granted_by to UUID

-- First, drop the existing table if it exists
DROP TABLE IF EXISTS public.user_permissions;

-- Recreate with correct schema
CREATE TABLE public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  can_upload BOOLEAN DEFAULT false NOT NULL,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on user_permissions
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- User permissions policies
CREATE POLICY "Authenticated users can view permissions" ON public.user_permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can manage permissions" ON public.user_permissions
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'puneet@gmail.com'
    )
  );

-- Trigger for updated_at on user_permissions
CREATE TRIGGER update_user_permissions_updated_at
  BEFORE UPDATE ON public.user_permissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert admin user with upload permissions
-- First check if admin user exists in auth.users, if not, this will be handled when they sign up
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'puneet@gmail.com') THEN
    INSERT INTO public.user_permissions (user_id, email, can_upload, granted_by)
    SELECT 
      id, 
      email, 
      true, 
      id
    FROM auth.users 
    WHERE email = 'puneet@gmail.com'
    ON CONFLICT (email) DO UPDATE SET can_upload = true;
  ELSE
    -- Create a pending permission record for admin
    INSERT INTO public.user_permissions (user_id, email, can_upload, granted_by)
    VALUES (null, 'puneet@gmail.com', true, null)
    ON CONFLICT (email) DO UPDATE SET can_upload = true;
  END IF;
END $$;