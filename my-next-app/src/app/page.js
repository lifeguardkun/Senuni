import 'server-only';
import { createClient } from '@/lib/supabase/server';
import Login from '@/components/Login';
import Logout from '@/components/Logout';
import Inbox from '@/components/Inbox';
import Archive from '@/components/Archive';

export const dynamic = 'force-dynamic';

export default async function Home() {

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser(); //セッション確認

  // cookieでセッションが得られなければログイン画面
  if (error || !user) {
    return <Login />;
  }

  // ログイン済み
  return (
    <>
      <header>
        <Logout/>
      </header>

      <main className="flex h-screen">
        <div className="w-1/2 border-r p-4 overflow-auto">
          <Inbox />
        </div>
        <div className="w-1/2 p-4 overflow-auto bg-gray-50">
          <Archive />
        </div>
      </main>
    </>
  );
}