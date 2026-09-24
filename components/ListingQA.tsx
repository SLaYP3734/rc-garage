'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { timeAgo } from '@/lib/time';
import AuthModal from '@/components/AuthModal';

type CommentRow = {
  id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
  username: string | null;
};

// İlanın altındaki "Soru & Cevap" bölümü. Herkes soru sorabilir, herkes
// cevap yazabilir (genelde satıcı cevaplar, o yüzden satıcının cevabı
// "Satıcı" rozetiyle ayrı gösteriliyor). Yeni soru/cevap geldiğinde
// ilgili kişilere otomatik bildirim gidiyor (schema-listing-qa.sql).
export default function ListingQA({ listingId, ownerId }: { listingId: string; ownerId: string }) {
  const supabase = createClient();
  const [meId, setMeId] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [posting, setPosting] = useState(false);
  const [replyOpenFor, setReplyOpenFor] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [authOpen, setAuthOpen] = useState(false);

  const loadComments = useCallback(async () => {
    const { data } = await supabase
      .from('listing_comments')
      .select('id, user_id, parent_id, body, created_at, profiles(username)')
      .eq('listing_id', listingId)
      .order('created_at', { ascending: true });

    setComments((data ?? []).map((r: any) => ({ ...r, username: r.profiles?.username ?? null })));
    setLoading(false);
  }, [supabase, listingId]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setMeId(user?.id ?? null));
    loadComments();
  }, [loadComments, supabase]);

  async function submitQuestion() {
    if (!meId) {
      setAuthOpen(true);
      return;
    }
    if (!question.trim()) return;

    setPosting(true);
    const { error } = await supabase
      .from('listing_comments')
      .insert({ listing_id: listingId, user_id: meId, body: question.trim() });
    setPosting(false);

    if (!error) {
      setQuestion('');
      await loadComments();
    }
  }

  async function submitReply(parentId: string) {
    if (!meId) {
      setAuthOpen(true);
      return;
    }
    if (!replyText.trim()) return;

    setPosting(true);
    const { error } = await supabase
      .from('listing_comments')
      .insert({ listing_id: listingId, user_id: meId, parent_id: parentId, body: replyText.trim() });
    setPosting(false);

    if (!error) {
      setReplyText('');
      setReplyOpenFor(null);
      await loadComments();
    }
  }

  const topLevel = comments.filter((c) => !c.parent_id);
  const repliesFor = (id: string) => comments.filter((c) => c.parent_id === id);

  if (loading) return null;

  return (
    <div className="mt-6">
      <h2 className="mb-2.5 text-[15px] font-bold text-zinc-300">💬 Soru &amp; Cevap</h2>

      <div className="mb-3 flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitQuestion()}
          placeholder="Ürünle ilgili bir soru sor..."
          className="h-[44px] flex-1 rounded-xl border border-border bg-cardAlt px-3.5 text-sm outline-none focus:border-accent"
        />
        <button
          onClick={submitQuestion}
          disabled={posting}
          className="shrink-0 rounded-xl bg-accent px-4 text-sm font-bold text-black disabled:opacity-60"
        >
          Sor
        </button>
      </div>

      {topLevel.length === 0 && <p className="text-sm text-muted">Henüz soru yok. İlk soruyu sen sor.</p>}

      <div className="space-y-3">
        {topLevel.map((c) => (
          <div key={c.id} className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-mutedDim">
              <span className="font-semibold text-zinc-300">{c.username || 'RC Atölyesi üyesi'}</span>
              <span>· {timeAgo(c.created_at)}</span>
            </div>
            <p className="mt-1 text-[13.5px] text-zinc-200">{c.body}</p>

            {repliesFor(c.id).map((r) => (
              <div key={r.id} className="ml-3 mt-2 rounded-lg border border-border bg-cardAlt p-2.5">
                <div className="flex items-center gap-1.5 text-[11px] text-mutedDim">
                  <span className={`font-semibold ${r.user_id === ownerId ? 'text-accent2' : 'text-zinc-300'}`}>
                    {r.username || 'RC Atölyesi üyesi'}
                    {r.user_id === ownerId && ' · Satıcı'}
                  </span>
                  <span>· {timeAgo(r.created_at)}</span>
                </div>
                <p className="mt-1 text-[13px] text-zinc-200">{r.body}</p>
              </div>
            ))}

            {meId &&
              (replyOpenFor === c.id ? (
                <div className="mt-2 flex gap-1.5">
                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitReply(c.id)}
                    placeholder="Cevap yaz..."
                    autoFocus
                    className="h-[38px] flex-1 rounded-lg border border-border bg-cardAlt px-3 text-[12.5px] outline-none focus:border-accent"
                  />
                  <button
                    onClick={() => submitReply(c.id)}
                    disabled={posting}
                    className="rounded-lg bg-accent px-3 text-[12px] font-bold text-black disabled:opacity-60"
                  >
                    Gönder
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setReplyOpenFor(c.id);
                    setReplyText('');
                  }}
                  className="mt-1.5 text-[11.5px] font-semibold text-accent2"
                >
                  Cevapla
                </button>
              ))}
          </div>
        ))}
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
