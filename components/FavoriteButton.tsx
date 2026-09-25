'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import AuthModal from '@/components/AuthModal';

// İlan detayındaki "Favorile" butonu. Favorilenen bir ilanın fiyatı
// düşerse, favorileyen kişiye otomatik push bildirimi gidiyor
// (schema-batch4.sql -> notify_price_drop trigger'ı).
export default function FavoriteButton({ listingId }: { listingId: string }) {
  const supabase = createClient();
  const [meId, setMeId] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user || cancelled) {
        setChecking(false);
        return;
      }
      setMeId(user.id);

      const { data } = await supabase
        .from('listing_favorites')
        .select('id')
        .eq('listing_id', listingId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!cancelled) {
        setFavorited(!!data);
        setChecking(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [supabase, listingId]);

  async function toggle() {
    if (!meId) {
      setAuthOpen(true);
      return;
    }
    if (busy) return;
    setBusy(true);

    if (favorited) {
      setFavorited(false);
      await supabase.from('listing_favorites').delete().eq('listing_id', listingId).eq('user_id', meId);
    } else {
      setFavorited(true);
      await supabase.from('listing_favorites').insert({ listing_id: listingId, user_id: meId });
    }

    setBusy(false);
  }

  if (checking) return null;

  return (
    <>
      <button
        onClick={toggle}
        disabled={busy}
        className={`flex h-[44px] items-center justify-center gap-1.5 rounded-xl border px-4 text-sm font-bold transition disabled:opacity-60 ${
          favorited ? 'border-accent/40 bg-accent/15 text-accent2' : 'border-border bg-cardAlt text-zinc-300'
        }`}
      >
        {favorited ? '★ Favorilendi' : '☆ Favorile'}
      </button>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
