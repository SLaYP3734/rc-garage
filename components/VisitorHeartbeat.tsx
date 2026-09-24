'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

const HEARTBEAT_MS = 30 * 1000;

function getSessionId() {
  try {
    let id = window.sessionStorage.getItem('rc-visitor-id');
    if (!id) {
      id = crypto.randomUUID();
      window.sessionStorage.setItem('rc-visitor-id', id);
    }
    return id;
  } catch {
    // sessionStorage kapalıysa (gizli sekme vb.) her sayfa yüklemesinde
    // yeni bir ziyaretçi sayılır — sorun değil, sadece sayı biraz
    // yuvarlanır.
    return crypto.randomUUID();
  }
}

// Görünmez bileşen: SİTEYE GİREN HERKES için (üye olsun olmasın)
// çalışır — admin panelindeki "şu an sitede X kişi var" sayacının
// kaynağı bu. Kişisel bilgi göndermiyor, sadece rastgele bir kimlik +
// zaman.
export default function VisitorHeartbeat() {
  useEffect(() => {
    const supabase = createClient();
    const sessionId = getSessionId();
    let cancelled = false;

    async function beat() {
      if (cancelled) return;
      await supabase
        .from('live_visitors')
        .upsert({ session_id: sessionId, last_seen_at: new Date().toISOString() });

      // Arada bir (~%2 ihtimalle) bir günden eski bayat kayıtları temizle.
      if (Math.random() < 0.02) {
        await supabase
          .from('live_visitors')
          .delete()
          .lt('last_seen_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      }
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
