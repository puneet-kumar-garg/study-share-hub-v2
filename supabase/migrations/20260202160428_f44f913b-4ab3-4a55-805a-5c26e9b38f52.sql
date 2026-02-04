-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Create subjects enum
CREATE TYPE public.subject_type AS ENUM (
  'principles_of_ai',
  'numerical_methods', 
  'cloud_computing',
  'full_stack_dev_2',
  'system_design',
  'competitive_coding_2'
);

-- Create status enum
CREATE TYPE public.worksheet_status AS ENUM ('completed', 'unsolved');

-- Create worksheets table
CREATE TABLE public.worksheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject public.subject_type NOT NULL,
  status public.worksheet_status NOT NULL DEFAULT 'unsolved',
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  tags TEXT[],
  uploader_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  download_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on worksheets
ALTER TABLE public.worksheets ENABLE ROW LEVEL SECURITY;

-- Worksheets policies
CREATE POLICY "Anyone can view worksheets" ON public.worksheets
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can upload worksheets" ON public.worksheets
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "Users can update own worksheets" ON public.worksheets
  FOR UPDATE TO authenticated USING (auth.uid() = uploader_id);

CREATE POLICY "Users can delete own worksheets" ON public.worksheets
  FOR DELETE TO authenticated USING (auth.uid() = uploader_id);

-- Create downloads tracking table
CREATE TABLE public.downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worksheet_id UUID REFERENCES public.worksheets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(worksheet_id, user_id)
);

-- Enable RLS on downloads
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

-- Downloads policies
CREATE POLICY "Users can view own downloads" ON public.downloads
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can track downloads" ON public.downloads
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for worksheets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'worksheets',
  'worksheets',
  true,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'image/jpeg', 'image/png', 'image/webp']
);

-- Storage policies for worksheets bucket
CREATE POLICY "Authenticated users can upload worksheets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'worksheets');

CREATE POLICY "Anyone can view worksheets files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'worksheets');

CREATE POLICY "Users can delete own worksheet files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'worksheets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to increment download count
CREATE OR REPLACE FUNCTION public.increment_download_count(worksheet_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.worksheets
  SET download_count = download_count + 1
  WHERE id = worksheet_uuid;
END;
$$;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_worksheets_updated_at
  BEFORE UPDATE ON public.worksheets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to auto-create profile on signup
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

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();