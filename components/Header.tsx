import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import AuthTrigger from './AuthTrigger';

export default async function Header() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-10 flex h-[62px] items-center justify-between border-b border-border bg-surface/95 px-[17px] backdrop-blur">
      <Link href="/">
        <strong className="tracking-[1.5px]">
          <i className="not-italic text-accent">RC</i> ATÖLYESİ
        </strong>
      </Link>

      {user ? (
        <Link
          href="/profil"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-black"
        >
          ✓
        </Link>
      ) : (
        <AuthTrigger className="text-2xl text-white">👤</AuthTrigger>
      )}
    </header>
  );
}
