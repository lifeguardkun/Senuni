'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function loginAction() {
  const supabase = await createClient();

  // OAuth認証フローを開始
  const { data,error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://senuni.vercel.app/auth/callback',
      scopes: 'https://www.googleapis.com/auth/gmail.readonly',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  console.log('Supabase Auth Response:', { data, error });

  // 生成されたGoogleの認証URLへリダイレクト
  if (data.url) {
    redirect(data.url);
  }
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const cookieStore = await cookies();
  cookieStore.delete('google_refresh_token');
  redirect('/');
}