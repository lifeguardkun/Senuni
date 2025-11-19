export const CategoryTree = ({ categories, messages }) => {
  
  // 再帰レンダリング関数
  const renderNode = (parentId) => {
    // 現在の親IDに属するカテゴリのみ抽出
    const childCats = categories.filter(c => c.parent_id === parentId);
    
    // 現在の親ID(カテゴリ)に属するメッセージのみ抽出
    // parentIdがnull(ルート)のメッセージはStockListで表示するため除外しても良い
    const childMsgs = messages.filter(m => m.category_id === parentId);

    if (childCats.length === 0 && childMsgs.length === 0) return null;

    return (
      <ul style={{ marginLeft: '20px', borderLeft: '1px solid #ddd' }}>
        {/* メッセージの表示 */}
        {childMsgs.map(msg => (
          <li key={`msg-${msg.id}`} style={{ color: '#555', margin: '5px 0' }}>
            ✉️ {msg.subject}
          </li>
        ))}

        {/* 子カテゴリの表示 (再帰) */}
        {childCats.map(cat => (
          <li key={`cat-${cat.id}`} style={{ margin: '10px 0' }}>
            <strong>📁 {cat.name}</strong>
            {renderNode(cat.id)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <h2>Hierarchical Archive</h2>
      {/* ルート(parent_id: null)から開始 */}
      {renderNode(null)} 
    </div>
  );
};