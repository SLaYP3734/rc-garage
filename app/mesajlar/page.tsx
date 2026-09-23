'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { timeAgo } from '@/lib/time';
import { playNotificationSound } from '@/lib/notificationSound';
import { isOnline } from '@/lib/presence';
import AuthModal from '@/components/AuthModal';

type ConversationRow = {
  otherId: string;
  username: string;
  lastBody: string;
  lastAt: string;
  unread: number;
  lastSeenAt: string | null;
};

export default function MessagesInboxPage() {
  const supabase = createClient();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const prevUnreadTotalRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setCheckingAuth(false);
          setAuthOpen(true);
        }
        return;
      }

      if (!cancelled) setCheckingAuth(false);

      const { data, error } = await supabase
        .from('messages')
        .select(
          'id, sender_id, receiver_id, body, created_at, read_at, sender:profiles!messages_sender_id_fkey(username, last_seen_at), receiver:profiles!messages_receiver_id_fkey(username, last_seen_at)'
        )
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
        if (!cancelled) setLoading(false);
        return;
      }

      const map = new Map<string, ConversationRow>();

      (data || []).forEach((m: any) => {
        const isMine = m.sender_id === user.id;
        const otherId = isMine ? m.receiver_id : m.sender_id;
        const otherProfile = isMine ? m.receiver : m.sender;
        const otherUsername = otherProfile?.username || 'RC Atölyesi üyesi';

        if (!map.has(otherId)) {
          map.set(otherId, {
            otherId,
            username: otherUsername,
            lastBody: m.body,
            lastAt: m.created_at,
            unread: 0,
            lastSeenAt: otherProfile?.last_seen_at ?? null
          });
        }

        if (!isMine && !m.read_at) {
          const row = map.get(otherId)!;
          row.unread += 1;
        }
      });

      if (!cancelled) {
        const rows = Array.from(map.values());
        const totalUnread = rows.reduce((sum, r) => sum + r.unread, 0);

        if (prevUnreadTotalRef.current !== null && totalUnread > prevUnreadTotalRef.current) {
          playNotificationSound();
        }
        prevUnreadTotalRef.current = totalUnread;

        setConversations(rows);
        setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 8000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [supabase]);

  if (checkingAuth) {
    return <div className="p-6 text-center text-muted">Yükleniyor...</div>;
  }

  return (
    <div className="px-4 py-5">
      <h1 className="mb-4 text-lg font-bold">💬 Mesajlar</h1>

      {loading && <p className="text-sm text-muted">Yükleniyor...</p>}

      {!loading && conversations.length === 0 && (
        <p className="text-sm text-muted">
          Henüz bir mesajlaşman yok. Bir soru veya yanıtın altındaki "Mesaj Gönder" ile başlayabilirsin.
        </p>
      )}

      <div className="space-y-2">
        {conversations.map((c) => (
          <Link
            key={c.otherId}
            href={`/mesajlar/${c.otherId}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3.5 py-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {isOnline(c.lastSeenAt) && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />}
                <span className="font-semibold text-zinc-100">{c.username}</span>
                {c.unread > 0 && (
                  <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-black">
                    {c.unread}
                  </span>
                )}
              </div>
              <p className="truncate text-[13px] text-muted">{c.lastBody}</p>
            </div>
            <span className="shrink-0 text-[11px] text-mutedDim">{timeAgo(c.lastAt)}</span>
          </Link>
        ))}
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
