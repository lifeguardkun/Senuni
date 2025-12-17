'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// カテゴリが存在すればIDを返し、なければ作成してIDを返すヘルパー関数
async function ensureCategory(supabase, name, parentId = null) {
  // 1. 検索
  let query = supabase
    .from('categories')
    .select('id')
    .eq('name', name);

  if (parentId) {
    query = query.eq('parent_id', parentId);
  } else {
    query = query.is('parent_id', null);
  }

  const { data: existing } = await query.maybeSingle();

  if (existing) return existing.id;

  // 2. 作成
  const { data: created, error } = await supabase
    .from('categories')
    .insert({ name, parent_id: parentId })
    .select('id')
    .single();

  if (error) {
    console.error(`Error creating category ${name}:`, error);
    return null;
  }
  return created.id;
}


// メインの振り分けアクション
export async function autoCategorize(messageId, sender, subject, snippet) {
  const supabase = await createClient();
  let targetCategoryId = null;

  // --- A. Google Classroom のロジック ---
  if (sender.includes('classroom.google.com')) {
    const rootId = await ensureCategory(supabase, 'Google Classroom');
    
    // インデックス1を採用 (スペース区切り)
    const words = (snippet || '').trim().split(/\s+/);
    const subCategoryName = words[1]; 

    if (subCategoryName) {
      targetCategoryId = await ensureCategory(supabase, subCategoryName, rootId);
    } else {
      targetCategoryId = rootId;
    }

  } 
  // --- B. In Campus のロジック ---
  else if (sender.includes('senshu-u.ac.jp')) {
    // ルートカテゴリ確保
    let currentParentId = await ensureCategory(supabase, 'In Campus');
    
    // 【】で挟まれた文字をすべて抽出
    const regex = /(?<=【)[^】]+(?=】)/g;
    const matches = (subject || '').match(regex);

    if (matches && matches.length > 0) {
      // マッチした順に階層を掘り下げる
      for (const matchName of matches) {
        currentParentId = await ensureCategory(supabase, matchName, currentParentId);
      }
      targetCategoryId = currentParentId;
    } else {
      // ★修正: マッチしない場合は「In Campus」の中の「その他」に入れる
      targetCategoryId = await ensureCategory(supabase, 'その他', currentParentId);
    }

  } 
  // --- C. その他 (送信者が特定できない場合) ---
  else {
    targetCategoryId = await ensureCategory(supabase, 'Others');
  }

  // DB更新
  if (targetCategoryId) {
    await supabase
      .from('messages')
      .update({ category_id: targetCategoryId })
      .eq('id', messageId);
  }

  revalidatePath('/');
}


// 手動移動用: メッセージのカテゴリIDを更新
export async function assignCategory(messageId, categoryId) {
  const supabase = await createClient();
  await supabase
    .from('messages')
    .update({ category_id: categoryId })
    .eq('id', messageId);
  
  revalidatePath('/');
}

// 手動作成用: 新規カテゴリを作成してIDを返す
export async function addCategory(name, parentId = null) {
  const supabase = await createClient();
  
  // parentIdが空文字('')の場合はnullに変換
  const pid = parentId === '' ? null : parentId;

  const { data, error } = await supabase
    .from('categories')
    .insert({ name, parent_id: pid })
    .select('id')
    .single();

  if (error) {
    console.error('Create category failed:', error);
    return null;
  }
  
  revalidatePath('/');
  return data.id;
}