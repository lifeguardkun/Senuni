import { supabase } from './Supabase';

const GMAIL_SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

export const signInWithGoogle = () => {
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      scopes: GMAIL_SCOPES,
    },
  });
};

export const signOut = () => {
  supabase.auth.signOut();
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};