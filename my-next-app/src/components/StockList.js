'use client';

import { useOptimistic, useState, useTransition, useEffect } from 'react';
import { autoCategorize } from '@/actions/category-actions';
import { fetchMessageBody } from '@/actions/sync-actions'; // Actionをインポート

export default function StockList({ initialMessages }) {
  const [optimisticMessages, removeOptimisticMessage] = useOptimistic(
    initialMessages,
    (state, idToRemove) => state.filter((msg) => msg.id !== idToRemove)
  );

  const [selectedMsg, setSelectedMsg] = useState(null);
  const [emailBody, setEmailBody] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (selectedMsg) {
      setEmailBody('');
      fetchMessageBody(selectedMsg.gmail_id).then((body) => {
        setEmailBody(body);
      });
    }
  }, [selectedMsg]);

  const handleArchive = () => {
    if (!selectedMsg) return;
    const { id, sender, subject, snippet } = selectedMsg;

    setSelectedMsg(null);

    startTransition(async () => {
      removeOptimisticMessage(id);
      await autoCategorize(id, sender, subject, snippet);
    });
  };

  return (
    <>
      <ul className="space-y-2">
        {optimisticMessages.map((msg) => (
          <li 
            key={msg.id} 
            onClick={() => setSelectedMsg(msg)}
            className="cursor-pointer rounded-lg border bg-white p-4 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <div className="font-bold text-gray-900">{msg.subject || '(No Subject)'}</div>
            <div className="text-xs text-gray-500">{msg.sender}</div>
            <div className="mt-1 text-sm text-gray-600 truncate">{msg.snippet}</div>
          </li>
        ))}
        {optimisticMessages.length === 0 && (
          <p className="text-center text-gray-500 py-8">Inbox is empty! 🎉</p>
        )}
      </ul>

      {selectedMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl max-h-[80vh] flex flex-col rounded-xl bg-white shadow-2xl overflow-hidden">
            <button 
              onClick={() => setSelectedMsg(null)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center"
            >
              ✕
            </button>
            <div className="p-6 border-b">
              <h3 className="pr-8 text-xl font-bold text-gray-900 mb-1">{selectedMsg.subject}</h3>
              <p className="text-sm text-gray-500">From: {selectedMsg.sender}</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {emailBody ? (
                <div className="prose max-w-none text-sm" dangerouslySetInnerHTML={{ __html: emailBody }} />
              ) : (
                <div className="flex items-center justify-center h-40 text-gray-400 animate-pulse">Loading...</div>
              )}
            </div>

            <div className="p-4 border-t bg-white flex justify-end gap-3">
              <button 
                onClick={() => setSelectedMsg(null)}
                className="rounded px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={handleArchive}
                disabled={isPending}
                className="rounded bg-blue-600 px-6 py-2 text-sm font-bold text-white shadow hover:bg-blue-700 disabled:opacity-50"
              >
                {isPending ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}