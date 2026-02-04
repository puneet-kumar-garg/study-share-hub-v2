import { supabase } from '@/integrations/supabase/client';

const ADMIN_EMAIL = 'puneet@gmail.com';

export const migrateExistingUsersToDownloadOnly = async (): Promise<void> => {
  try {
    // Get all existing users from profiles table
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, email');

    if (!profiles) return;

    // Get admin user ID
    const adminProfile = profiles.find(p => p.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
    if (!adminProfile) {
      console.error('Admin profile not found');
      return;
    }

    // Create permission records for all users
    const permissionRecords = profiles.map(profile => ({
      user_id: profile.user_id,
      email: profile.email.toLowerCase(),
      can_upload: profile.email.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
      granted_by: adminProfile.user_id
    }));

    // Insert/update permissions for all users
    const { error } = await supabase
      .from('user_permissions')
      .upsert(permissionRecords, { onConflict: 'user_id' });

    if (error) {
      console.error('Error migrating permissions:', error);
    } else {
      console.log('Successfully migrated permissions for existing users');
    }
  } catch (error) {
    console.error('Migration failed:', error);
  }
};