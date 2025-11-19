import Script from 'next/script';
import { signInWithGoogle, signOut } from '../lib/Auth';
import { CategoryManager } from '../components/CategoryManager';
import { StockList } from '../components/StockList';      // 追加
import { CategoryTree } from '../components/CategoryTree'; // 追加

import { ManageAuth } from '../hooks/ManageAuth';
import { MessageSync } from '../hooks/MessageSync';
import { useCategories } from '../hooks/CategoryController';

function Home() {
  const { session, isReady, loadGapi } = ManageAuth();
  const { categories, addCategory } = useCategories(session);
  
  // assignCategory と categorizedMessages を受け取る
  const { stockMessages, categorizedMessages, assignCategory } = MessageSync(isReady);

  return (
    <>
      <Script src="https://apis.google.com/js/api.js" onLoad={loadGapi} />

      {!session ? (
        <button onClick={signInWithGoogle}>Authentication</button>
      ) : (
          <button onClick={signOut}>
            Log out
          </button>
      )}

      {session && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* 左カラム: インボックスと操作 */}
          <div>

            <StockList 
              messages={stockMessages} 
              categories={categories}
              onAssign={assignCategory} 
              onAddCategory={addCategory} // ★ここが重要
            />
          </div>

          {/* 右カラム: 階層化されたアーカイブ */}
          <div>
            <CategoryTree 
              categories={categories} 
              messages={categorizedMessages} 
            />
          </div>
          
        </div>
      )}
    </>
  );
}

export default Home;