'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { VAPID_PUBLIC_KEY, pushSupported, syncPushSubscription, requestAndSubscribe } from '@/lib/pushClient';

type Status = 'idle' | 'loading' | 'granted' | 'denied' | 'unsupported';

// Profil sayfasındaki "Bildirimleri Aç" butonu. Kullanıcıdan izin ister,
// tarayıcıdan bir bildirim aboneliği oluşturur ve bunu sunucuya kaydeder.
// iPhone'da sadece site "Ana Ekrana Eklenmiş" ve öyle açılmışsa çalışır
// (Safari 16.4+ kısıtlaması, hangi tarayıcıdan eklendiği fark etmez).
export default function PushSubscribe() {
  const supabase = createClient();
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    if (!pushSupported()) {
      setStatus('unsupported');
      return;
    }

    if (Notification.permission === 'denied') {
      setStatus('denied');
      return;
    }

    if (Notification.permission === 'granted') {
      // İzin telefonda zaten açık (belki başka bir hesapla açılmıştı).
      // Bu profili şu an kim görüyorsa, aboneliği sessizce ona bağla.
      setStatus('granted');
      syncPushSubscription(supabase).catch((err) => console.error(err));
    }
  }, [supabase]);

  async function enable() {
    setStatus('loading');
    try {
      const result = await requestAndSubscribe(supabase);
      setStatus(result === 'unsupported' ? 'unsupported' : result);
    } catch (err) {
      console.error(err);
      setStatus('idle');
    }
  }

  if (status === 'unsupported' || !VAPID_PUBLIC_KEY) return null;

  return (
    <button
      onClick={enable}
      disabled={status === 'loading' || status === 'granted'}
      className="mb-2.5 w-full rounded-xl border border-border bg-cardAlt py-3 text-sm font-bold text-zinc-300 disabled:opacity-60"
    >
      {status === 'granted'
        ? '🔔 Bildirimler Açık'
        : status === 'denied'
        ? '🔕 Bildirimler Engelli (Telefon Ayarlarından Aç)'
        : status === 'loading'
        ? 'Açılıyor...'
        : '🔔 Bildirimleri Aç'}
    </button>
  );
}
