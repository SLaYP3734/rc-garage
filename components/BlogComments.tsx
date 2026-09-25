'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/authUser';
import { timeAgo } from '@/lib/time';
import AuthModal from '@/components/AuthModal';

const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID;

type CommentRow = {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
  username: string | null;
};

// Blog yazısının altındaki yorum bölümü — düz liste (yanıt zinciri yok),
// herkes yorum yazabilir. Kendi yorumunu veya admin herhangi bir yorumu
// silebilir.
export default function BlogComments({ postId }: { postId: string }) {
  const supabase = createClient();
  const [meId, setMeId] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const loadComments = useCallback(async () => {
    const { data } = await supabase
      .from('blog_comments')
      .select('id, user_id, body, created_at, profiles(username)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    setComments((data ?? []).map((r: any) => ({ ...r, username: r.profiles?.username ?? null })));
    setLoading(false);
  }, [supabase, postId]);

  useEffect(() => {
    getCurrentUser(supabase).then((user) => setMeId(user?.id ?? null));
    loadComments();
  }, [loadComments, supabase]);

  async function submit() {
    if (!meId) {
      setAuthOpen(true);
      return;
    }
    if (!text.trim()) return;

    setPosting(true);
    const { error } = await supabase.from('blog_comments').insert({ post_id: postId, user_id: meId, body: text.trim() });
    setPosting(false);

    if (!error) {
      setText('');
      await loadComments();
    } else {
      alert(error.message);
    }
  }

  async function remove(id: string) {
    if (!confirm('Bu yorumu silmek istediğine emin misin?')) return;
    const { error } = await supabase.from('blog_comments').delete().eq('id', id);
    if (!error) setComments((prev) => prev.filter((c) => c.id !== id));
  }

  if (loading) return null;

  return (
    <div className="mt-8">
      <h2 className="mb-2.5 text-[15px] font-bold text-zinc-300">💬 Yorumlar</h2>

      <div className="mb-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Bir yorum yaz..."
          className="h-[44px] flex-1 rounded-xl border border-border bg-cardAlt px-3.5 text-sm outline-none focus:border-accent"
        />
        <button
          onClick={submit}
          disabled={posting}
          className="shrink-0 rounded-xl bg-accent px-4 text-sm font-bold text-black disabled:opacity-60"
        >
          Gönder
        </button>
      </div>

      {comments.length === 0 && <p className="text-sm text-muted">Henüz yorum yok. İlk yorumu sen yaz.</p>}

      <div className="space-y-2.5">
        {comments.map((c) => (
          <div key={c.id} className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-mutedDim">
              <span className="font-semibold text-zinc-300">{c.username || 'RC Atölyesi üyesi'}</span>
              <span>· {timeAgo(c.created_at)}</span>
              {(meId === c.user_id || (ADMIN_USER_ID && meId === ADMIN_USER_ID)) && (
                <button onClick={() => remove(c.id)} className="ml-auto text-[11px] font-semibold text-red-400">
                  Sil
                </button>
              )}
            </div>
            <p className="mt-1 text-[13.5px] text-zinc-200">{c.body}</p>
          </div>
        ))}
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
