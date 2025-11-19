import { useState, useEffect } from 'react';
import { supabase } from '../lib/Supabase';
import { initGapiClient } from '../lib/GmailAPI';
import { getSession } from '../lib/Auth';

export const ManageAuth = () => {

  const [gapiReady, setGapiReady] = useState(false);
  const [session, setSession] = useState(null);

  // GAPIの初期化 (ScriptタグのonLoadで呼ぶ)
  const loadGapi = async () => {
    await initGapiClient();
    setGapiReady(true);
  };
  
  // Supabaseセッション管理
  useEffect(() => {
    getSession().then(setSession);
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  // GAPIのロードとSupabaseのセッションがあれば、GAPIにトークンを付与
  useEffect(() => {
    if (gapiReady && session?.provider_token) {
      gapi.client.setToken({ access_token: session.provider_token });
    }
  }, [gapiReady, session]);

  return {
    loadGapi,
    session,
    isReady: gapiReady && !!session, // 両方準備完了したかどうかのフラグ
  };
};