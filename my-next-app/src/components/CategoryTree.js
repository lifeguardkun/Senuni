import 'server-only';

export default function CategoryTree({ categories, messages }) {
  
  // 再帰レンダリング関数
  const renderNode = (parentId) => {
    const childCats = categories.filter(c => c.parent_id === parentId);
    const childMsgs = messages.filter(m => m.category_id === parentId);

    if (childCats.length === 0 && childMsgs.length === 0) return null;

    return (
      <ul>
        {/* メッセージ */}
        {childMsgs.map(msg => (
          <li key={`msg-${msg.id}`}>✉️ {msg.subject}</li>
        ))}
        
        {/* サブカテゴリ (再帰呼び出し) */}
        {childCats.map(cat => (
          <li key={`cat-${cat.id}`}>
            <strong>📁 {cat.name}</strong>
            {renderNode(cat.id)}
          </li>
        ))}
      </ul>
    );
  };

  // ルートから描画開始
  return <div>{renderNode(null)}</div>;
}