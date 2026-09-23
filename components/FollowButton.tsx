'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import AuthModal from '@/components/AuthModal';

// Bir satıcı/kullanıcı profilinde "Takip Et" / "Takip Ediliyor" butonu.
// Giriş yapmamış birisi tıklarsa önce giriş/kayıt modalı açılıyor.
export default function FollowButton({ targetUserId }: { targetUserId: string }) {
  const supabase = createClient();
  const [meId, setMeId] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        if (!cancelled) setChecking(false);
        return;
      }
      if (cancelled) return;
      setMeId(user.id);

      const { data } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('follower_id', user.id)
        .eq('followed_id', targetUserId)
        .maybeSingle();

      if (!cancelled) {
        setFollowing(!!data);
        setChecking(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [supabase, targetUserId]);

  async function toggle() {
    if (!meId) {
      setAuthOpen(true);
      return;
    }

    setBusy(true);

    if (following) {
      setFollowing(false);
      await supabase.from('follows').delete().eq('follower_id', meId).eq('followed_id', targetUserId);
    } else {
      setFollowing(true);
      await supabase.from('follows').insert({ follower_id: meId, followed_id: targetUserId });
    }

    setBusy(false);
  }

  if (checking) return null;
  if (meId === targetUserId) return null;

  return (
    <>
      <button
        onClick={toggle}
        disabled={busy}
        className={`w-full rounded-xl py-3 text-center text-sm font-extrabold transition disabled:opacity-60 ${
          following
            ? 'border border-border bg-cardAlt text-zinc-300'
            : 'bg-accent text-black'
        }`}
      >
        {following ? '✓ Takip Ediliyor' : '+ Takip Et'}
      </button>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
