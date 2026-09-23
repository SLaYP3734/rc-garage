'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

const HEARTBEAT_MS = 45 * 1000;

// Görünmez bileşen: giriş yapmış kullanıcı sitede aktifken belirli
// aralıklarla profiles.last_seen_at'i günceller. Bu sayede mesajlaşmada
// "Çevrimiçi" / "Son görülme: X önce" gösterebiliyoruz.
export default function PresenceHeartbeat() {
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function beat() {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user || cancelled) return;

      await supabase.from('profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', user.id);
    }

    beat();
    const interval = setInterval(beat, HEARTBEAT_MS);

    function onVisible() {
      if (document.visibilityState === 'visible') beat();
    }
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return null;
}
