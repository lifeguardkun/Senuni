'use client';

import { useState } from 'react';
import { assignCategory, addCategory } from '@/actions/category-actions';
import { fetchMessageBody } from '@/actions/sync-actions'; // ★追加

export default function CategoryTree({ initialCategories, initialMessages }) {
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [mode, setMode] = useState('existing');
  const [targetCatId, setTargetCatId] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatParent, setNewCatParent] = useState('');
  
  // ★本文表示用のState
  const [bodyContent, setBodyContent] = useState('');
  const [isLoadingBody, setIsLoadingBody] = useState(false);

  // メッセージ選択時のハンドラ
  const handleSelectMsg = async (msg) => {
    setSelectedMsg(msg);
    setTargetCatId(msg.category_id);
    
    // 本文取得開始
    setBodyContent('');
    setIsLoadingBody(true);
    
    // Server Action呼び出し (DB内のgmail_idを使用)
    const content = await fetchMessageBody(msg.gmail_id);
    
    setBodyContent(content);
    setIsLoadingBody(false);
  };

  const renderNode = (parentId) => {
    // ... (フィルタリングロジックは変更なし) ...
    const childCats = initialCategories.filter(c => c.parent_id === parentId);
    const childMsgs = initialMessages.filter(m => m.category_id === parentId);
    if (childCats.length === 0 && childMsgs.length === 0) return null;

    return (
      <ul className="pl-4 border-l border-gray-200 ml-1">
        {childMsgs.map(msg => (
          <li 
            key={`msg-${msg.id}`} 
            className="cursor-pointer hover:bg-blue-50 text-sm py-1 truncate"
            onClick={() => handleSelectMsg(msg)} // ★ハンドラ変更
          >
            ✉️ <span className="text-gray-700">{msg.subject || '(No Subject)'}</span>
          </li>
        ))}
        {/* ... (カテゴリ再帰部分は変更なし) ... */}
        {childCats.map(cat => (
           <li key={`cat-${cat.id}`} className="mt-1">
             <div className="font-bold text-gray-800 text-sm">📁 {cat.name}</div>
             {renderNode(cat.id)}
           </li>
        ))}
      </ul>
    );
  };

  // ... (handleMove 関数等は変更なし) ...
  const handleMove = async () => { /* ... */ };

  return (
    <div>
      {renderNode(null)}

      {selectedMsg && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 relative max-h-[90vh] flex flex-col">
            
            <button 
              onClick={() => setSelectedMsg(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >✕</button>

            <h3 className="text-lg font-bold mb-1 mr-8">{selectedMsg.subject}</h3>
            <p className="text-xs text-gray-500 mb-4">From: {selectedMsg.sender}</p>

            {/* ★本文エリア (HTML表示) */}
            <div className="flex-1 overflow-y-auto bg-gray-50 border rounded p-4 mb-4">
              {isLoadingBody ? (
                <div className="flex justify-center items-center h-40 text-gray-400">
                  <span className="animate-pulse">Loading content from Gmail...</span>
                </div>
              ) : (
                <div 
                  className="prose prose-sm max-w-none"
                  // HTMLメールを表示するため dangerouslySetInnerHTML を使用
                  dangerouslySetInnerHTML={{ __html: bodyContent }} 
                />
              )}
            </div>

            {/* カテゴリ移動フォーム (下部に固定) */}
            <div className="border-t pt-4 bg-white">
               {/* ... (以前と同じフォームUI) ... */}
               <div className="flex gap-2 mb-3 text-sm">
                  <button onClick={() => setMode('existing')} className="...">Select Existing</button>
                  <button onClick={() => setMode('new')} className="...">Create New</button>
               </div>
               
               <div className="flex gap-2 items-center">
                 {mode === 'existing' ? (
                    <select 
                      className="flex-1 border p-2 rounded"
                      value={targetCatId}
                      onChange={(e) => setTargetCatId(e.target.value)}
                    >
                      <option value="">Select Category...</option>
                      {initialCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                 ) : (
                    <>
                      <select className="border p-2 rounded" value={newCatParent} onChange={(e) => setNewCatParent(e.target.value)}>
                        <option value="">(Root)</option>
                        {initialCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <input className="flex-1 border p-2 rounded" placeholder="New Name" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
                    </>
                 )}
                 <button onClick={handleMove} className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">
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