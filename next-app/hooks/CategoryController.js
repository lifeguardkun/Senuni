import { useState, useEffect } from 'react';
import { supabase } from '../lib/Supabase';

export const useCategories = (session) => {
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    if (!session) return;
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true }); // 名前順の方が見つけやすいかも
    setCategories(data || []);
  };

  // ★修正点: 作成したカテゴリのIDを返すように変更
  const addCategory = async (name, parentId = null) => {
    if (!name) return null;

    const { data, error } = await supabase
      .from('categories')
      .insert({ name: name, parent_id: parentId })
      .select(); // .select() を付けるとInsertしたデータが返ってくる

    if (error) {
      console.error('Error adding category:', error);
      return null;
    }

    // リストを再取得して画面上のドロップダウンを更新
    await fetchCategories();

    // 作成されたカテゴリのIDを返す (dataは配列)
    return data[0]?.id;
  };

  useEffect(() => {
    fetchCategories();
  }, [session]);

  return {
    categories,
    addCategory, 
    fetchCategories
  };
};