import 'server-only';
import { createClient } from '@/lib/supabase/server';

export async function getInboxMessages() {
  const supabase = await createClient();
  
  // 未分類のメッセージを取得
  const { data } = await supabase
    .from('messages')
    .select('*')
    .is('category_id', null)
    .order('received_at', { ascending: false });

  return data || [];
}

export async function getCategories() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  return data || [];
}

export async function getCategorizedMessages() {
    const supabase = await createClient();
    
    // 分類済のメッセージを取得
    const { data } = await supabase
      .from('messages')
      .select('*')
      .not('category_id', 'is', null)
      .order('received_at', { ascending: false });
  
    return data || [];
  }