-- MANUAL FIX FOR USER_PERMISSIONS TABLE
-- Run this SQL in your Supabase dashboard SQL editor

-- Step 1: Create the handle_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Step 2: Drop the existing user_permissions table
DROP TABLE IF EXISTS public.user_permissions CASCADE;

-- Step 3: Recreate with correct schema
CREATE TABLE public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  can_upload BOOLEAN DEFAULT false NOT NULL,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Step 4: Enable RLS on user_permissions
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Step 5: Create policies
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

-- Step 6: Create trigger for updated_at
CREATE TRIGGER update_user_permissions_updated_at
  BEFORE UPDATE ON public.user_permissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Step 7: Insert admin user permissions
-- This will work if the admin user already exists in auth.users
INSERT INTO public.user_permissions (user_id, email, can_upload, granted_by)
SELECT 
  id, 
  email, 
  true, 
  id
FROM auth.users 
WHERE email = 'puneet@gmail.com'
ON CONFLICT (email) DO UPDATE SET can_upload = true;

-- Step 8: Update the handle_new_user function to link pending permissions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  
  -- Update any pending permissions for this email
  UPDATE public.user_permissions 
  SET user_id = NEW.id 
  WHERE email = NEW.email AND user_id IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;