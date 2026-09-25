'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/authUser';
import AuthModal from './AuthModal';

// Bir kategori filtrelenmişken (?kategori=...) gösterilen küçük bir
// "bu kategoriyi takip et" düğmesi. Takip edilince, o kategoride yeni
// soru açıldığında kullanıcıya bildirim gidiyor (bkz. notify_category_follow).
export default function CategoryFollowButton() {
  const searchParams = useSearchParams();
  const category = searchParams.get('kategori');
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (!category) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      const user = await getCurrentUser(supabase);
      if (cancelled) return;

      setUserId(user?.id ?? null);

      if (user) {
        const { data } = await supabase
          .from('category_follows')
          .select('id')
          .eq('user_id', user.id)
          .eq('category', category)
          .maybeSingle();
        if (!cancelled) setFollowing(!!data);
      }

      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  if (!category || loading) return null;

  const toggle = async () => {
    if (!userId) {
      setShowAuth(true);
      return;
    }

    setBusy(true);

    if (following) {
      await supabase.from('category_follows').delete().eq('user_id', userId).eq('category', category);
      setFollowing(false);
    } else {
      await supabase.from('category_follows').insert({ user_id: userId, category });
      setFollowing(true);
    }

    setBusy(false);
  };

  return (
    <>
      <div className="px-4 pb-2">
        <button
          onClick={toggle}
          disabled={busy}
          className={`rounded-lg border px-3 py-1.5 text-[12.5px] font-semibold transition ${
            following
              ? 'border-accent/40 bg-accent/10 text-accent2'
              : 'border-border bg-cardAlt text-zinc-300 hover:bg-zinc-700/40'
          }`}
        >
          {following ? '🔔 Bu kategoriyi takip ediyorsun' : '🔔 Bu kategoriyi takip et'}
        </button>
      </div>

      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
