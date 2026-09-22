'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { playNotificationSound } from '@/lib/notificationSound';

const items = [
  { href: '/', label: 'Akış', icon: '⌂' },
  { href: '/sorun/yeni', label: 'Sorun Sor', icon: '＋', primary: true },
  { href: '/mesajlar', label: 'Mesajlar', icon: '💬' },
  { href: '/al-sat', label: 'Al / Sat', icon: '🛒' },
  { href: '/profil', label: 'Profil', icon: '👤' }
];

export default function BottomNav() {
  const pathname = usePathname();
  const supabase = createClient();
  const [unread, setUnread] = useState(0);
  const prevUnreadRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkUnread() {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) setUnread(0);
        return;
      }

      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .is('read_at', null);

      const newCount = count || 0;

      if (!cancelled) {
        // Sayı önceki kontrole göre arttıysa (yeni bir mesaj geldiyse) ses çal.
        if (prevUnreadRef.current !== null && newCount > prevUnreadRef.current) {
          playNotificationSound();
        }
        prevUnreadRef.current = newCount;
        setUnread(newCount);
      }
    }

    checkUnread();
    const interval = setInterval(checkUnread, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [supabase, pathname]);

  return (
    <nav className="fixed bottom-0 left-1/2 z-10 grid h-[72px] w-full max-w-app -translate-x-1/2 grid-cols-5 border-t border-border bg-[#121214fa]">
      {items.map((item) => {
        const active = pathname === item.href;

        if (item.primary) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-2xl text-black">
                {item.icon}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex flex-col items-center justify-center gap-1 text-xl ${
              active ? 'text-white' : 'text-muted'
            }`}
          >
            {item.icon}
            {item.href === '/mesajlar' && unread > 0 && (
              <span className="absolute right-[26%] top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-black">
                {unread}
              </span>
            )}
            <small className="text-[10px]">{item.label}</small>
          </Link>
        );
      })}
    </nav>
  );
}
