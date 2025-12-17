import 'server-only';
import { getCategorizedMessages, getCategories } from '@/lib/data';
import CategoryTree from '@/components/CategoryTree';

export default async function Archive() {
  const [messages, categories] = await Promise.all([
    getCategorizedMessages(),
    getCategories()
  ]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 sticky top-0 bg-white p-2 border-b">Archive</h2>
      <CategoryTree initialCategories={categories} initialMessages={messages} />
    </div>
  );
}