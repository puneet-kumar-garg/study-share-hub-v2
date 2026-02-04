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
    // First get the user ID from the email
    const { data: userData } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', userEmail.toLowerCase())
      .single();
    
    if (!userData) {
      return false;
    }
    
    const { data, error } = await supabase
      .from('user_permissions')
      .select('can_upload')
      .eq('user_id', userData.user_id)
      .single();
    
    // If there's an error (like no record exists), deny access
    if (error) {
      console.log('Permission check error (denying access):', error.message);
      return false;
    }
    
    return data?.can_upload || false;
  } catch (error) {
    // Default: users can only download, not upload
    console.log('Permission check failed (denying access):', error);
    return false;
  }
};

export const grantUploadPermission = async (email: string, grantedByEmail: string): Promise<boolean> => {
  try {
    console.log('Granting permission to:', email, 'by:', grantedByEmail);
    
    // Get user IDs for both users
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', email.toLowerCase())
      .single();
    
    const { data: grantingUser } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', grantedByEmail.toLowerCase())
      .single();
    
    if (!targetUser || !grantingUser) {
      console.error('User not found');
      return false;
    }
    
    const { error } = await supabase
      .from('user_permissions')
      .upsert({
        user_id: targetUser.user_id,
        email: email.toLowerCase(),
        can_upload: true,
        granted_by: grantingUser.user_id
      });
    
    if (error) {
      console.error('Database error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Grant permission error:', error);
    return false;
  }
};

export const revokeUploadPermission = async (email: string): Promise<boolean> => {
  try {
    // Get user ID from email
    const { data: userData } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', email.toLowerCase())
      .single();
    
    if (!userData) {
      return false;
    }
    
    const { error } = await supabase
      .from('user_permissions')
      .update({ can_upload: false })
      .eq('user_id', userData.user_id);
    
    return !error;
  } catch {
    return false;
  }
};