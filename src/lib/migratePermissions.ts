import { supabase } from '@/integrations/supabase/client';

const ADMIN_EMAIL = 'puneet@gmail.com';

export const migrateExistingUsersToDownloadOnly = async (): Promise<void> => {
  try {
    // Get all existing users from profiles table
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, email');

    if (!profiles) return;

    // Create permission records for all users
    const permissionRecords = profiles.map(profile => ({
      email: profile.email.toLowerCase(),
      can_upload: profile.email.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
      granted_by: ADMIN_EMAIL
    }));

    // Insert/update permissions for all users
    const { error } = await supabase
      .from('user_permissions')
      .upsert(permissionRecords, { onConflict: 'email' });

    if (error) {
      console.error('Error migrating permissions:', error);
    } else {
      console.log('Successfully migrated permissions for existing users');
    }
  } catch (error) {
    console.error('Migration failed:', error);
  }
};