import { supabase } from '@/integrations/supabase/client';

// Admin email - only this user can manage permissions
const ADMIN_EMAIL = 'puneet@gmail.com';

export const isAdmin = (userEmail: string): boolean => {
  return userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();
};

export const canUserUpload = async (userEmail: string): Promise<boolean> => {
  // Admin always has upload permissions
  if (isAdmin(userEmail)) {
    return true;
  }
  
  try {
    const { data, error } = await supabase
      .from('user_permissions')
      .select('can_upload')
      .eq('email', userEmail.toLowerCase())
      .single();
    
    if (error) {
      console.log('Permission check error (denying access):', error.message);
      return false;
    }
    
    return data?.can_upload || false;
  } catch (error) {
    console.log('Permission check failed (denying access):', error);
    return false;
  }
};

export const grantUploadPermission = async (email: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_permissions')
      .upsert({
        email: email.toLowerCase(),
        can_upload: true
      });
    
    return !error;
  } catch (error) {
    console.error('Grant permission error:', error);
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