import 'server-only';
import { getInboxMessages, getCategories } from '@/lib/data';
import StockList from '@/components/StockList';
import SyncManager from '@/components/SyncManager';

export default async function Inbox() {
  // DBから初期データを並行取得
  const [messages, categories] = await Promise.all([
    getInboxMessages(),
    getCategories()
  ]);

  return (
    <div>
      <h2>Inbox</h2>
      {/* 自動同期・手動同期ボタン */}
      <SyncManager />
      
      {/* 楽観的UIを持つリスト */}
      <StockList initialMessages={messages} categories={categories} />
    </div>
  );
}