-- Complete the setup
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