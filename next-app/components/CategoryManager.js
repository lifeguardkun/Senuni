import { useState } from 'react';

export const CategoryManager = ({ categories, onAddCategory }) => {
  const [newCatName, setNewCatName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState(''); // 空文字なら親なし(Top)

  const handleSubmit = () => {
    // parentIdは空文字なら null に変換して渡す
    const parentId = selectedParentId === '' ? null : selectedParentId;
    onAddCategory(newCatName, parentId);
    
    // フォームリセット
    setNewCatName('');
    setSelectedParentId('');
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0' }}>
      <h3>Category Manager</h3>

      {/* --- 作成フォーム --- */}
      <div style={{ marginBottom: '1rem' }}>
        <input 
          type="text" 
          placeholder="New Category Name" 
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
        />
        
        {/* 親カテゴリ選択ドロップダウン */}
        <select 
          value={selectedParentId} 
          onChange={(e) => setSelectedParentId(e.target.value)}
          style={{ marginLeft: '0.5rem' }}
        >
          <option value="">Top Level (No Parent)</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <button onClick={handleSubmit} style={{ marginLeft: '0.5rem' }}>
          Add
        </button>
      </div>

      {/* --- リスト表示 --- */}
      <ul>
        {categories.map((cat) => {
          // 親カテゴリの名前を探す（表示用）
          const parentName = categories.find(c => c.id === cat.parent_id)?.name || 'Top';
          
          return (
            <li key={cat.id}>
              {cat.name} <span style={{ fontSize: '0.8em', color: '#666' }}>(Parent: {parentName})</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};