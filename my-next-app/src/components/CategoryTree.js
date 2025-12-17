'use client';

import { useState, useMemo } from 'react';
import { assignCategory, addCategory } from '@/actions/category-actions';
import { fetchMessageBody } from '@/actions/sync-actions'; // ★変更

export default function CategoryTree({ initialCategories, initialMessages }) {
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [mode, setMode] = useState('existing'); // 'existing' | 'new'
  
  // フォームの状態
  const [targetCatId, setTargetCatId] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatParent, setNewCatParent] = useState('');

  // 本文表示用
  const [bodyContent, setBodyContent] = useState('');
  const [isLoadingBody, setIsLoadingBody] = useState(false);

  // ★改善: カテゴリのフルパス名を生成してソートする (セレクトボックス用)
  const categoryOptions = useMemo(() => {
    const getFullPath = (cat) => {
      let path = cat.name;
      let current = cat;
      while (current.parent_id) {
        const parent = initialCategories.find(c => c.id === current.parent_id);
        if (parent) {
          path = `${parent.name} > ${path}`;
          current = parent;
        } else {
          break;
        }
      }
      return path;
    };

    return initialCategories
      .map(cat => ({
        ...cat,
        displayName: getFullPath(cat) // 例: "In Campus > 重要 > 教務課"
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [initialCategories]);


  // メッセージ選択時のハンドラ
  const handleSelectMsg = async (msg) => {
    setSelectedMsg(msg);
    setTargetCatId(msg.category_id || '');
    setMode('existing');
    
    setBodyContent('');
    setIsLoadingBody(true);
    
    // ★変更: fetchMessageBody を使用
    const content = await fetchMessageBody(msg.gmail_id);
    setBodyContent(content);
    setIsLoadingBody(false);
  };

  // Moveボタン処理
  const handleMove = async () => {
    if (!selectedMsg) return;
    
    try {
      if (mode === 'existing') {
        if (!targetCatId) {
          alert('Please select a category.');
          return;
        }
        await assignCategory(selectedMsg.id, targetCatId);
      } else {
        if (!newCatName) {
          alert('Please enter a category name.');
          return;
        }
        const createdId = await addCategory(newCatName, newCatParent || null);
        if (createdId) {
          await assignCategory(selectedMsg.id, createdId);
        }
      }
      
      setSelectedMsg(null);
      setNewCatName('');
      setTargetCatId('');

    } catch (error) {
      console.error('Move failed:', error);
      alert('Failed to move message.');
    }
  };

  // ツリー描画 (空のカテゴリは非表示にするロジック込み)
  const renderNode = (parentId) => {
    const childMsgs = initialMessages.filter(m => m.category_id === parentId);
    const childCats = initialCategories.filter(c => c.parent_id === parentId);

    // 子カテゴリの中身を先に計算
    const visibleChildCats = childCats.map(cat => {
      const childrenElement = renderNode(cat.id);
      if (!childrenElement) return null; // 中身がなければnull

      return (
        <li key={`cat-${cat.id}`} className="mt-1">
          <div className="font-bold text-gray-800 text-sm">📁 {cat.name}</div>
          {childrenElement}
        </li>
      );
    }).filter(Boolean);

    // メッセージも表示すべき子カテゴリもなければ非表示
    if (childMsgs.length === 0 && visibleChildCats.length === 0) {
      return null;
    }

    return (
      <ul className="pl-4 border-l border-gray-200 ml-1">
        {childMsgs.map(msg => (
          <li 
            key={`msg-${msg.id}`} 
            className="cursor-pointer hover:bg-blue-50 text-sm py-1 truncate flex items-center gap-2"
            onClick={() => handleSelectMsg(msg)}
          >
            <span>✉️</span>
            <span className="text-gray-700">{msg.subject || '(No Subject)'}</span>
          </li>
        ))}
        {visibleChildCats}
      </ul>
    );
  };

  return (
    <div>
      {/* ツリー本体 */}
      {renderNode(null)}

      {/* 詳細モーダル */}
      {selectedMsg && (
        // ★変更: 背景色 bg-black/60
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 relative max-h-[90vh] flex flex-col">
            
            <button 
              onClick={() => setSelectedMsg(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold"
            >✕</button>

            <h3 className="text-lg font-bold mb-1 mr-8 truncate">{selectedMsg.subject}</h3>
            <p className="text-xs text-gray-500 mb-4">From: {selectedMsg.sender}</p>

            <div className="flex-1 overflow-y-auto bg-gray-50 border rounded p-4 mb-4 min-h-[200px]">
              {isLoadingBody ? (
                <div className="flex justify-center items-center h-full text-gray-400">
                  <span className="animate-pulse">Loading content...</span>
                </div>
              ) : (
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: bodyContent }} 
                />
              )}
            </div>

            {/* カテゴリ操作エリア */}
            <div className="border-t pt-4 bg-white">
               <div className="flex gap-2 mb-3 text-sm">
                  <button 
                    onClick={() => setMode('existing')} 
                    className={`px-3 py-1 rounded border ${mode === 'existing' ? 'bg-blue-100 border-blue-400' : 'bg-gray-100'}`}
                  >
                    Select Existing
                  </button>
                  <button 
                    onClick={() => setMode('new')} 
                    className={`px-3 py-1 rounded border ${mode === 'new' ? 'bg-blue-100 border-blue-400' : 'bg-gray-100'}`}
                  >
                    Create New
                  </button>
               </div>
               
               <div className="flex gap-2 items-center">
                 {mode === 'existing' ? (
                    // ★改善: フルパスを表示するセレクトボックス
                    <select 
                      className="flex-1 border p-2 rounded text-sm"
                      value={targetCatId}
                      onChange={(e) => setTargetCatId(e.target.value)}
                    >
                      <option value="">Select Category...</option>
                      {categoryOptions.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.displayName}
                        </option>
                      ))}
                    </select>
                 ) : (
                    <>
                      {/* 親カテゴリ選択もフルパス表示で見やすく */}
                      <select 
                        className="w-1/3 border p-2 rounded text-sm" 
                        value={newCatParent} 
                        onChange={(e) => setNewCatParent(e.target.value)}
                      >
                        <option value="">(Root)</option>
                        {categoryOptions.map(c => (
                          <option key={c.id} value={c.id}>
                            Under: {c.displayName}
                          </option>
                        ))}
                      </select>
                      <input 
                        className="flex-1 border p-2 rounded" 
                        placeholder="New Category Name" 
                        value={newCatName} 
                        onChange={(e) => setNewCatName(e.target.value)} 
                      />
                    </>
                 )}

                 <button 
                   onClick={handleMove} 
                   className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 whitespace-nowrap"
                 >
                   Move
                 </button>
               </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}