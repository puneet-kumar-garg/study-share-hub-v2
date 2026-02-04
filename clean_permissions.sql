CREATE TYPE public.user_role AS ENUM ('admin', 'uploader', 'viewer');

DROP TABLE IF EXISTS public.user_permissions CASCADE;

CREATE TABLE public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  role public.user_role DEFAULT 'viewer' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

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

INSERT INTO public.user_permissions (email, role)
VALUES ('puneet@gmail.com', 'admin');