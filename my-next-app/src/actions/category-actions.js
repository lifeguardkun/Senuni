'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// 送信者に基づいて自動分類してアーカイブする
export async function autoCategorize(messageId, sender) {
  const supabase = await createClient();
  
  // 1. 送信者からカテゴリ名を決定
  let targetCategoryName = 'Others'; // デフォルト
  if (sender.includes('senshu-u.ac.jp')) {
    targetCategoryName = 'In Campus';
  } else if (sender.includes('classroom.google.com')) {
    targetCategoryName = 'Google Classroom';
  }

  // 2. カテゴリIDを取得（なければ作成）
  // ここでは既存のカテゴリを探す処理にします
  let { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('name', targetCategoryName)
    .single();

  // カテゴリが見つからなかった場合、新規作成するロジックを入れても良いですが
  // 今回は簡略化のため、見つかった場合のみ振り分けます
  if (category) {
    await supabase
      .from('messages')
      .update({ category_id: category.id })
      .eq('id', messageId);
  }

  revalidatePath('/');
}