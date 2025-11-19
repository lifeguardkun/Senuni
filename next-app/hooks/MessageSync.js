import { useState, useEffect } from 'react';
import { supabase } from '../lib/Supabase';
import { fetchIncampusMessages, fetchClassroomMessages } from '../lib/GmailAPI';

export const MessageSync = (isReady) => {
  const [stockMessages, setStockMessages] = useState([]); // 未分類 (Inbox)
  const [categorizedMessages, setCategorizedMessages] = useState([]); // 分類済み (Tree用)

  const loadMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('received_at', { ascending: false });

    if (data) {
      setStockMessages(data.filter(m => m.category_id === null));
      setCategorizedMessages(data.filter(m => m.category_id !== null));
    }
  };

  const syncMessages = async () => {
    if (!isReady) return;

    const incampusData = await fetchIncampusMessages();
    const classroomData = await fetchClassroomMessages();

    const formatForDb = (msgs) => msgs.map(msg => ({
      gmail_id: msg.gmail_id,
      snippet: msg.snippet,
      subject: msg.subject,
      sender: msg.sender,
      received_at: msg.received_at,
    }));

    await Promise.all([
      supabase.from('messages').upsert(formatForDb(incampusData), { onConflict: 'user_id, gmail_id' }),
      supabase.from('messages').upsert(formatForDb(classroomData), { onConflict: 'user_id, gmail_id' })
    ]);

    await loadMessages();
  };

  // ★追加: カテゴリを割り当てる関数
  const assignCategory = async (messageId, categoryId) => {
    await supabase
      .from('messages')
      .update({ category_id: categoryId })
      .eq('id', messageId); // gmail_idではなくDBのPK(id)推奨だが、なければgmail_idで

    await loadMessages();
  };

  useEffect(() => {
    const checkSessionAndLoad = async () => {
       const { data } = await supabase.auth.getSession();
       if(data.session) loadMessages();
    };
    checkSessionAndLoad();
  }, []);

  useEffect(() => {
    if (isReady) syncMessages();
  }, [isReady]);

  return {
    stockMessages,       // 未分類
    categorizedMessages, // 分類済み
    syncMessages,
    assignCategory       // これをUIに渡す
  };
};