import { getSupabaseClient, isSupabaseConfigured } from '../config/supabase';
import { identifyUser } from './premium';

type AuthResult = { success: boolean; error?: string };

type ProfileUpdate = {
  fullName?: string;
  email?: string;
  marketingOptIn?: boolean;
};

async function upsertProfile(userId: string, update: ProfileUpdate): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const payload: Record<string, any> = {
    id: userId,
    updated_at: new Date().toISOString(),
  };

  if (typeof update.email === 'string') {
    payload.email = update.email;
  }

  if (typeof update.fullName === 'string') {
    payload.full_name = update.fullName;
  }

  if (typeof update.marketingOptIn === 'boolean') {
    payload.marketing_opt_in = update.marketingOptIn;
  }

  try {
    const { error } = await client
      .from('profiles')
      .upsert(payload, { onConflict: 'id' });
    if (error) {
      console.warn('Failed to upsert profile:', error.message);
    }
  } catch (error) {
    console.warn('Profile upsert failed:', error);
  }
}

async function updateUserMetadata(update: ProfileUpdate): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const data: Record<string, any> = {};
  if (typeof update.fullName === 'string') {
    data.full_name = update.fullName;
  }
  if (typeof update.marketingOptIn === 'boolean') {
    data.marketing_opt_in = update.marketingOptIn;
  }

  if (Object.keys(data).length === 0) return;

  try {
    await client.auth.updateUser({ data });
  } catch (error) {
    console.warn('Failed to update user metadata:', error);
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName?: string,
  marketingOptIn?: boolean
): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase not configured' };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client not available' };
  }

  try {
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || undefined,
          marketing_opt_in: marketingOptIn === true ? true : undefined,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data?.user?.id) {
      await upsertProfile(data.user.id, { fullName, email, marketingOptIn });
      // Sync with RevenueCat
      identifyUser(data.user.id);
    }

    return { success: true };
  } catch (error) {
    console.error('Error signing up with email:', error);
    return { success: false, error: 'Failed to create account' };
  }
}

export async function signInWithEmailPassword(
  email: string,
  password: string,
  marketingOptIn?: boolean
): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase not configured' };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client not available' };
  }

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data?.user?.id) {
      await updateUserMetadata({ marketingOptIn });
      await upsertProfile(data.user.id, { email, marketingOptIn });
      // Sync with RevenueCat
      identifyUser(data.user.id);
    }

    return { success: true };
  } catch (error) {
    console.error('Error signing in with email:', error);
    return { success: false, error: 'Failed to sign in' };
  }
}

export async function signInWithAppleIdToken(
  identityToken: string,
  update?: ProfileUpdate
): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase not configured' };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client not available' };
  }

  try {
    const { data, error } = await client.auth.signInWithIdToken({
      provider: 'apple',
      token: identityToken,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data?.user?.id) {
      await updateUserMetadata(update || {});
      await upsertProfile(data.user.id, {
        email: data.user.email,
        fullName: update?.fullName,
        marketingOptIn: update?.marketingOptIn,
      });
      // Sync with RevenueCat
      identifyUser(data.user.id);
    }

    return { success: true };
  } catch (error) {
    console.error('Error signing in with Apple:', error);
    return { success: false, error: 'Apple sign-in failed' };
  }
}

export async function signOutFromSupabase(): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client not available' };

  try {
    const { error } = await client.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error: 'Failed to sign out' };
  }
}

export async function deleteSupabaseAccount(): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase not configured' };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client not available' };
  }

  try {
    const invoke = client.functions?.invoke;
    if (typeof invoke !== 'function') {
      return { success: false, error: 'Account deletion not configured' };
    }

    const { error } = await invoke('delete-account');
    if (error) {
      return { success: false, error: error.message };
    }

    try {
      await client.auth.signOut();
    } catch {
      // Ignore sign-out errors after deletion
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting account:', error);
    return { success: false, error: 'Failed to delete account' };
  }
}
