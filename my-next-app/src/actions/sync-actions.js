'use server';

import { createClient } from '@/lib/supabase/server';
import { google } from 'googleapis';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// ヘルパー関数 (内部利用)
async function fetchAndParseMessages(gmail, query) {
  const listRes = await gmail.users.messages.list({ userId: 'me', q: query, maxResults: 15 });
  const messages = listRes.data.messages || [];
  
  const details = await Promise.all(
    messages.map((msg) => gmail.users.messages.get({ userId: 'me', id: msg.id }))
  );

  return details.map((res) => {
    const data = res.data;
    const headers = data.payload.headers;
    const getHeader = (name) => headers.find((h) => h.name === name)?.value || '';

    return {
      gmail_id: data.id,
      snippet: data.snippet,
      subject: getHeader('Subject'),
      sender: getHeader('From'),
      received_at: new Date(parseInt(data.internalDate)).toISOString(),
    };
  });
}

// Action 1: メール一覧の同期
export async function syncEmails() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('google_refresh_token')?.value;

  if (!refreshToken) {
    console.error('Google Refresh Token not found.');
    return;
  }

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({ refresh_token: refreshToken });
  const gmail = google.gmail({ version: 'v1', auth });

  try {
    const incampusData = await fetchAndParseMessages(gmail, 'from:no-reply-incampus@isc.senshu-u.ac.jp');
    const classroomData = await fetchAndParseMessages(gmail, 'from:<no-reply@classroom.google.com>');

    const upsertData = (data) => supabase.from('messages').upsert(data, { onConflict: 'user_id, gmail_id' });
    await Promise.all([upsertData(incampusData), upsertData(classroomData)]);

    cookieStore.set('google_refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    revalidatePath('/');

  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Action 2: メール本文の取得
export async function fetchMessageBody(gmailId) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('google_refresh_token')?.value;

  if (!refreshToken) return 'Authentication expired.';

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({ refresh_token: refreshToken });
  const gmail = google.gmail({ version: 'v1', auth });

  try {
    const res = await gmail.users.messages.get({
      userId: 'me',
      id: gmailId,
      format: 'full',
    });

    const payload = res.data.payload;
    const decode = (str) => Buffer.from(str, 'base64url').toString('utf-8');
    let body = '';
    
    if (payload.body?.data) {
      body = decode(payload.body.data);
    } else if (payload.parts) {
      const findPart = (mime) => payload.parts.find(p => p.mimeType === mime);
      const htmlPart = findPart('text/html');
      const textPart = findPart('text/plain');
      if (htmlPart?.body?.data) body = decode(htmlPart.body.data);
      else if (textPart?.body?.data) body = decode(textPart.body.data);
    }
    return body || '(No Content)';
  } catch (e) {
    console.error(e);
    return 'Error loading message body.';
  }
}