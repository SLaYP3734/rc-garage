'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

type Status = 'idle' | 'loading' | 'granted' | 'denied' | 'unsupported';

// Profil sayfasındaki "Bildirimleri Aç" butonu. Kullanıcıdan izin ister,
// tarayıcıdan bir bildirim aboneliği oluşturur ve bunu sunucuya kaydeder.
// iPhone'da sadece site "Ana Ekrana Eklenmiş" ve öyle açılmışsa çalışır
// (Safari 16.4+ kısıtlaması, hangi tarayıcıdan eklendiği fark etmez).
// Aboneliği (var olan ya da yeni oluşturulan) sunucuya, O AN giriş yapmış
// olan hesap için kaydeder. push_subscriptions tablosunda "endpoint" tekil
// olduğu için, bu her çağrıldığında o telefonun/tarayıcının bildirim
// sahipliği otomatik olarak o anki hesaba geçer.
async function syncSubscription(
  supabase: ReturnType<typeof createClient>,
  setDebug: (s: string) => void
) {
  if (!VAPID_PUBLIC_KEY) {
    setDebug('vapid public key yok');
    return false;
  }

  const reg = await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  const sub =
    existing ||
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    }));

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    setDebug('giriş yapılmamış görünüyor (auth.getUser boş)');
    return false;
  }

  const endpointTail = sub.endpoint.slice(-12);

  try {
    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub)
    });
    const text = await res.text();
    setDebug(`user:${user.id.slice(0, 8)} endpoint:...${endpointTail} → ${res.status} ${text}`);
    return res.ok;
  } catch (err: any) {
    setDebug(`fetch hatası: ${err?.message || err}`);
    return false;
  }
}

export default function PushSubscribe() {
  const supabase = createClient();
  const [status, setStatus] = useState<Status>('idle');
  const [debug, setDebug] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
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
      syncSubscription(supabase, setDebug).catch((err) => setDebug(`sync hatası: ${err?.message || err}`));
    }
  }, [supabase]);

  async function enable() {
    if (!VAPID_PUBLIC_KEY) return;
    setStatus('loading');

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'denied' : 'idle');
        return;
      }

      const ok = await syncSubscription(supabase, setDebug);
      setStatus(ok ? 'granted' : 'idle');
    } catch (err: any) {
      setDebug(`enable hatası: ${err?.message || err}`);
      setStatus('idle');
    }
  }

  if (status === 'unsupported' || !VAPID_PUBLIC_KEY) return null;

  return (
    <div className="mb-2.5">
      <button
        onClick={enable}
        disabled={status === 'loading' || status === 'granted'}
        className="w-full rounded-xl border border-border bg-cardAlt py-3 text-sm font-bold text-zinc-300 disabled:opacity-60"
      >
        {status === 'granted'
          ? '🔔 Bildirimler Açık'
          : status === 'denied'
          ? '🔕 Bildirimler Engelli (Telefon Ayarlarından Aç)'
          : status === 'loading'
          ? 'Açılıyor...'
          : '🔔 Bildirimleri Aç'}
      </button>
      {/* GEÇİCİ debug satırı — sorunu bulduktan sonra kaldırılacak */}
      {debug && <p className="mt-1.5 break-all text-[10px] text-muted">{debug}</p>}
    </div>
  );
}
