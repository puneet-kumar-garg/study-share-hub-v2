import { supabase } from '@/integrations/supabase/client';

// Admin email - only this user can manage permissions
const ADMIN_EMAIL = 'puneetkumargarg@gmail.com';

export const isAdmin = (userEmail: string): boolean => {
  return userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();
};

export const canUserUpload = async (userEmail: string): Promise<boolean> => {
  try {
    const { data } = await supabase
      .from('user_permissions')
      .select('can_upload')
      .eq('email', userEmail.toLowerCase())
      .single();
    
    return data?.can_upload || false;
  } catch {
    return false;
  }
};

export const grantUploadPermission = async (email: string, grantedBy: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_permissions')
      .upsert({
        email: email.toLowerCase(),
        can_upload: true,
        granted_by: grantedBy
      });
    
    return !error;
  } catch {
    return false;
  }
};

export const revokeUploadPermission = async (email: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_permissions')
      .update({ can_upload: false })
      .eq('email', email.toLowerCase());
    
    return !error;
  } catch {
    return false;
  }
};