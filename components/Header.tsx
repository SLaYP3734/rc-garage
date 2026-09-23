import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import AuthTrigger from './AuthTrigger';
import Avatar from './Avatar';

export default async function Header() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  let avatarUrl: string | null = null;
  let username: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', user.id)
      .maybeSingle();
    avatarUrl = profile?.avatar_url ?? null;
    username = profile?.username ?? null;
  }

  return (
    <header className="sticky top-0 z-10 flex h-[62px] items-center justify-between border-b border-border bg-surface/95 px-[17px] backdrop-blur">
      <Link href="/">
        <strong className="text-xl font-extrabold tracking-[1.5px]">
          <i className="not-italic text-accent">RC</i> ATÖLYESİ
        </strong>
      </Link>

      {user ? (
        <Link href="/profil">
          <Avatar url={avatarUrl} name={username} size={36} />
        </Link>
      ) : (
        <AuthTrigger className="text-2xl text-white">👤</AuthTrigger>
      )}
    </header>
  );
}
