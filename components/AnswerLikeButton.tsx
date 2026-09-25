'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import AuthModal from '@/components/AuthModal';

// Bir cevabın altındaki "beğen" butonu — soru sahibi olmayan herkes bir
// cevabı beğenip yararlı bulduğunu gösterebilir (garage_likes ile aynı
// desen: answer_likes tablosu + answers.like_count'u tazeleyen trigger).
export default function AnswerLikeButton({
  answerId,
  initialCount
}: {
  answerId: string;
  initialCount: number;
}) {
  const supabase = createClient();
  const [likeCount, setLikeCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [meId, setMeId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user || cancelled) return;
      setMeId(user.id);

      const { data } = await supabase
        .from('answer_likes')
        .select('id')
        .eq('answer_id', answerId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!cancelled) setLiked(!!data);
    });

    return () => {
      cancelled = true;
    };
  }, [supabase, answerId]);

  async function toggleLike() {
    if (!meId) {
      setAuthOpen(true);
      return;
    }
    if (busy) return;
    setBusy(true);

    if (liked) {
      setLiked(false);
      setLikeCount((c) => Math.max(c - 1, 0));
      await supabase.from('answer_likes').delete().eq('answer_id', answerId).eq('user_id', meId);
    } else {
      setLiked(true);
      setLikeCount((c) => c + 1);
      await supabase.from('answer_likes').insert({ answer_id: answerId, user_id: meId });
    }

    setBusy(false);
  }

  return (
    <>
      <button
        onClick={toggleLike}
        disabled={busy}
        className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold transition ${
          liked ? 'border-accent/40 bg-accent/15 text-accent2' : 'border-border bg-cardAlt text-mutedDim'
        } disabled:opacity-70`}
      >
        {liked ? '👍' : '👍🏻'} {likeCount > 0 ? likeCount : 'Faydalı'}
      </button>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
