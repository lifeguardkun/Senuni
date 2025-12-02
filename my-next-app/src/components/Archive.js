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
      <h2>Archive</h2>
      <CategoryTree categories={categories} messages={messages} />
    </div>
  );
}