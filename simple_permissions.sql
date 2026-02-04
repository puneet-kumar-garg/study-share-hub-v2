-- SIMPLE ROLE-BASED PERMISSIONS
-- Run this in Supabase SQL editor

-- Create roles enum
CREATE TYPE public.user_role AS ENUM ('admin', 'uploader', 'viewer');

-- Drop existing table
DROP TABLE IF EXISTS public.user_permissions CASCADE;

-- Create simple user_permissions table
CREATE TABLE public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  role public.user_role DEFAULT 'viewer' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Simple policies
CREATE POLICY "Anyone can view permissions" ON public.user_permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can manage permissions" ON public.user_permissions
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'puneet@gmail.com'
    )
  );

-- Insert admin user
INSERT INTO public.user_permissions (email, role)
VALUES ('puneet@gmail.com', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';