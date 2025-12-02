'use client';

import { useEffect, useState, useTransition } from 'react';
import { syncEmails } from '@/actions/sync-actions';

export default function SyncManager() {
  const [isPending, startTransition] = useTransition();
  const [hasSynced, setHasSynced] = useState(false);

  const handleSync = () => {
    startTransition(async () => {
      await syncEmails();
    });
  };

  // マウント時に一度だけ自動同期を実行
  useEffect(() => {
    if (!hasSynced) {
      handleSync();
      setHasSynced(true);
    }
  }, []);

  return (
    <div>
      <button onClick={handleSync} disabled={isPending}>
        {isPending ? 'Syncing...' : 'Sync Gmail'}
      </button>
    </div>
  );
}