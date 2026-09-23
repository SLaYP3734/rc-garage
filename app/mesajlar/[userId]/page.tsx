'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { timeAgo } from '@/lib/time';
import { playNotificationSound } from '@/lib/notificationSound';
import { isOnline, presenceLabel } from '@/lib/presence';
import AuthModal from '@/components/AuthModal';

type Msg = {
  id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

export default function ConversationPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams<{ userId: string }>();
  const otherId = params.userId;

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [meId, setMeId] = useState<string | null>(null);
  const [otherUsername, setOtherUsername] = useState('');
  const [otherLastSeen, setOtherLastSeen] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
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

      if (cancelled) return;
      setMeId(user.id);
      setCheckingAuth(false);

      const { data: otherProfile } = await supabase
        .from('profiles')
        .select('username, last_seen_at')
        .eq('id', otherId)
        .single();

      if (!cancelled) {
        setOtherUsername(otherProfile?.username || 'RC Atölyesi üyesi');
        setOtherLastSeen(otherProfile?.last_seen_at ?? null);
      }
    }

    init();
    const presenceInterval = setInterval(async () => {
      const { data } = await supabase.from('profiles').select('last_seen_at').eq('id', otherId).maybeSingle();
      if (!cancelled) setOtherLastSeen(data?.last_seen_at ?? null);
    }, 20000);

    return () => {
      cancelled = true;
      clearInterval(presenceInterval);
    };
  }, [supabase, otherId]);

  useEffect(() => {
    if (!meId) return;
    let cancelled = false;

    async function load() {
      const { data, error } = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id, body, created_at, read_at')
        .or(
          `and(sender_id.eq.${meId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${meId})`
        )
        .order('created_at', { ascending: true });

      if (error) {
        console.error(error);
        return;
      }

      if (!cancelled) {
        const rows = data || [];

        // Karşı taraftan gelen yeni bir mesajla mesaj sayısı arttıysa ses çal.
        if (prevMessageCountRef.current !== null && rows.length > prevMessageCountRef.current) {
          const newOnes = rows.slice(prevMessageCountRef.current);
          if (newOnes.some((m) => m.sender_id !== meId)) {
            playNotificationSound();
          }
        }
        prevMessageCountRef.current = rows.length;

        setMessages(rows);

        const unreadIds = rows.filter((m) => m.receiver_id === meId && !m.read_at).map((m) => m.id);

        if (unreadIds.length) {
          await supabase.from('messages').update({ read_at: new Date().toISOString() }).in('id', unreadIds);
        }
      }
    }

    load();
    const interval = setInterval(load, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [supabase, meId, otherId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !meId) return;

    setSending(true);
    const body = draft.trim();
    setDraft('');

    const { error } = await supabase.from('messages').insert({
      sender_id: meId,
      receiver_id: otherId,
      body
    });

    setSending(false);

    if (error) {
      console.error(error);
      setDraft(body);
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        sender_id: meId,
        receiver_id: otherId as string,
        body,
        created_at: new Date().toISOString(),
        read_at: null
      }
    ]);
  }

  if (checkingAuth) {
    return <div className="p-6 text-center text-muted">Yükleniyor...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-62px-72px)] flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <button onClick={() => router.push('/mesajlar')} className="text-lg text-muted">
          ←
        </button>
        <Link href={`/satici/${otherUsername}`} className="min-w-0">
          <strong className="block truncate text-[15px] hover:text-accent2">{otherUsername}</strong>
          <span className="flex items-center gap-1 text-[11px] text-mutedDim">
            {isOnline(otherLastSeen) && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
            {presenceLabel(otherLastSeen)}
          </span>
        </Link>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {messages.map((m) => {
          const mine = m.sender_id === meId;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-[13.5px] ${
                  mine ? 'bg-accent text-black' : 'border border-border bg-card text-zinc-100'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.body}</p>
                <span
                  className={`mt-1 block text-right text-[10px] ${
                    mine ? 'text-black/60' : 'text-mutedDim'
                  }`}
                >
                  {timeAgo(m.created_at)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t border-border p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Mesaj yaz..."
          className="h-[46px] flex-1 rounded-xl border border-border bg-cardAlt px-3.5 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="h-[46px] rounded-xl bg-accent px-4 text-sm font-bold text-black disabled:opacity-60"
        >
          Gönder
        </button>
      </form>

      <AuthModal
        open={authOpen}
        onClose={() => {
          setAuthOpen(false);
          router.push('/');
        }}
      />
    </div>
  );
}
