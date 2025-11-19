import { useState } from 'react';

const StockItem = ({ message, categories, onAssign, onAddCategory }) => {
  // 'select' = 既存から選ぶ, 'create' = 新しく作る
  const [mode, setMode] = useState('select'); 
  
  // 既存選択用
  const [selectedExistId, setSelectedExistId] = useState('');

  // 新規作成用
  const [newCatName, setNewCatName] = useState('');
  const [newCatParentId, setNewCatParentId] = useState(''); // 親カテゴリ

  // --- アクション: 既存カテゴリに移動 ---
  const handleMoveExisting = () => {
    if (selectedExistId) {
      onAssign(message.id, selectedExistId);
    }
  };

  // --- アクション: 新規作成して移動 ---
  const handleCreateAndMove = async () => {
    if (!newCatName) return;

    // 1. カテゴリを作成し、そのIDを受け取る
    // parentIdが空文字ならnullに変換
    const parentId = newCatParentId === '' ? null : newCatParentId;
    const newId = await onAddCategory(newCatName, parentId);

    // 2. そのIDを使ってメッセージを移動
    if (newId) {
      onAssign(message.id, newId);
    }
  };

  return (
    <li style={{ 
      marginBottom: '1.5rem', padding: '1rem', 
      border: '1px solid #e0e0e0', borderRadius: '8px',
      backgroundColor: '#fff' 
    }}>
      {/* メッセージ内容 */}
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>{message.subject || '(No Subject)'}</h4>
        <p style={{ fontSize: '0.85em', color: '#666', margin: 0 }}>{message.snippet}</p>
      </div>

      {/* 操作パネル */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9em' }}>
        
        {/* モード切替ラジオボタン的なUI */}
        <div style={{ display: 'flex', gap: '5px', marginRight: '10px' }}>
          <button 
            onClick={() => setMode('select')}
            disabled={mode === 'select'}
            style={{ opacity: mode === 'select' ? 1 : 0.5 }}
          >
            Existing
          </button>
          <button 
            onClick={() => setMode('create')}
            disabled={mode === 'create'}
            style={{ opacity: mode === 'create' ? 1 : 0.5 }}
          >
            New
          </button>
        </div>

        {/* --- A: 既存カテゴリ選択モード --- */}
        {mode === 'select' && (
          <>
            <select 
              value={selectedExistId} 
              onChange={(e) => setSelectedExistId(e.target.value)}
              style={{ padding: '5px' }}
            >
              <option value="">Select Category...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <button onClick={handleMoveExisting} disabled={!selectedExistId}>
              Move
            </button>
          </>
        )}

        {/* --- B: 新規作成モード --- */}
        {mode === 'create' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {/* 親カテゴリ選択 */}
            <select 
              value={newCatParentId} 
              onChange={(e) => setNewCatParentId(e.target.value)}
              style={{ padding: '5px', maxWidth: '100px' }}
            >
              <option value="">(No Parent)</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <span>&gt;</span>
            {/* 新規カテゴリ名 */}
            <input 
              type="text" 
              placeholder="New Name" 
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              style={{ padding: '5px', width: '120px' }}
            />
            <button onClick={handleCreateAndMove} disabled={!newCatName}>
              Create & Move
            </button>
          </div>
        )}

      </div>
    </li>
  );
};

export const StockList = ({ messages, categories, onAssign, onAddCategory }) => {
  if (!messages.length) return <p>No uncategorized messages! 🎉</p>;

  return (
    <div>
      <h3>📥 Inbox ({messages.length})</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {messages.map(msg => (
          <StockItem 
            key={msg.id} 
            message={msg} 
            categories={categories} 
            onAssign={onAssign}
            onAddCategory={onAddCategory} // 追加: カテゴリ作成関数を渡す
          />
        ))}
      </ul>
    </div>
  );
};