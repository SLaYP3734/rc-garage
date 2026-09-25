import type { createClient } from '@/lib/supabase/client';

export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

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

export function pushSupported() {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    // iOS Safari/Chrome bu özelliği "Ana Ekrana Ekle" ile açılan
    // uygulamalarda true döndürüyor.
    (window.navigator as any).standalone === true
  );
}

// Var olan (ya da yeni oluşturulan) tarayıcı bildirim aboneliğini, O AN
// giriş yapmış olan hesap için sunucuya kaydeder. push_subscriptions
// tablosunda "endpoint" tekil olduğu için, bu her çağrıldığında o
// telefonun/tarayıcının bildirim sahipliği otomatik olarak o anki hesaba
// geçer (başka bir hesapla daha önce açılmış olsa bile).
export async function syncPushSubscription(supabase: ReturnType<typeof createClient>) {
  if (!VAPID_PUBLIC_KEY || !pushSupported()) return false;

  const reg = await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();

  let sub;
  try {
    sub =
      existing ||
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      }));
  } catch {
    // Bazı Android cihazlarda tarayıcının push kaydı arka planda
    // bozulabiliyor (izin açık ama abonelik geçersiz). Bunu bir kere
    // sıfırlayıp yeniden denemek genelde düzeltiyor.
    try {
      if (existing) await existing.unsubscribe();
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    } catch {
      return false;
    }
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return false;

  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sub)
  });

  return res.ok;
}

// İzin ister ve izin verilirse aboneliği kaydeder. true/false/'denied' döner.
export async function requestAndSubscribe(supabase: ReturnType<typeof createClient>) {
  if (!pushSupported() || !VAPID_PUBLIC_KEY) return 'unsupported' as const;

  const permission = await Notification.requestPermission();
  if (permission === 'denied') return 'denied' as const;
  if (permission !== 'granted') return 'idle' as const;

  const ok = await syncPushSubscription(supabase);
  return ok ? ('granted' as const) : ('idle' as const);
}
