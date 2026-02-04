import { supabase } from '@/integrations/supabase/client';

export const setupUserPermissionsTable = async (): Promise<boolean> => {
  try {
    // First, try to create the table if it doesn't exist
    const { error: createError } = await supabase.rpc('create_user_permissions_table');
    
    if (createError) {
      console.log('Table might already exist or RPC not available, trying direct insert...');
    }

    // Try to insert admin user permissions
    const { error: insertError } = await supabase
      .from('user_permissions')
      .upsert({
        email: 'puneet@gmail.com',
        can_upload: true,
        granted_by: 'system'
      });

    if (insertError) {
      console.error('Error setting up admin permissions:', insertError);
      return false;
    }

    console.log('User permissions table setup completed');
    return true;
  } catch (error) {
    console.error('Setup error:', error);
    return false;
  }
};